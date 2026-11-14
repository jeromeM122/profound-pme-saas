'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { HairTexture } from '@/generated/prisma/enums'
import { Prisma } from '@/generated/prisma/client'
import { parseVideoUrl } from '@/lib/social/video'
import { audit } from '@/server/audit'
import { db } from '@/server/db'
import { requireRole, requireUser } from '@/server/guards'
import { newKey, parseKey, VIDEO_MAX_BYTES, VIDEO_TYPES } from '@/server/media/keys'
import { deleteObject, getObject, objectSize, storageMode } from '@/server/media/storage'
import { hasRole } from '@/server/rbac'
import { limiter } from '@/server/security/ratelimit'

export type VideoState = { ok?: boolean; message?: string }

/** Step 1 of an upload: the server picks the storage key (the client never chooses it). */
export async function prepareVideoUpload(contentType: string, size: number): Promise<{ key: string; mode: 'blob' | 'local' } | { error: string }> {
  const me = await requireUser()
  if (!(await limiter().limit('upload', `u:${me.id}`)).success) return { error: 'Trop d’envois, réessaie plus tard.' }
  const ext = VIDEO_TYPES[contentType]
  if (!ext) return { error: 'Format accepté : MP4, MOV ou WebM.' }
  if (!Number.isFinite(size) || size <= 0 || size > VIDEO_MAX_BYTES) return { error: 'La vidéo doit faire moins de 60 Mo.' }
  return { key: newKey('videos', me.id, ext), mode: storageMode() }
}

const submitSchema = z.object({
  kind: z.enum(['link', 'upload']),
  url: z.string().max(300).optional(),
  key: z.string().max(200).optional(),
  productSlug: z.string().regex(/^[a-z0-9-]{1,90}$/).optional(),
  texture: z.enum(HairTexture).optional(),
  caption: z.string().max(200).optional(),
  consent: z.literal('on'),
  path: z.string().regex(/^\/[a-z0-9/_.@-]{0,100}$/i).optional(),
})

const clean = (s?: string) => s?.replace(/[\u0000-\u001F\u007F‪-‮⁦-⁩]/g, '').trim() || null

async function looksLikeVideo(key: string): Promise<boolean> {
  const head = await getObject(key, { start: 0, end: 15 })
  if (!head) return false
  const reader = head.stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (total < 16) {
    const { done, value } = await reader.read()
    if (done || !value) break
    chunks.push(value)
    total += value.length
  }
  await reader.cancel().catch(() => undefined)
  const b = Buffer.concat(chunks)
  return b.subarray(4, 8).toString('latin1') === 'ftyp' || b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))
}

/** Step 2: register a video (link or uploaded file). Goes to moderation unless the author is a moderator. */
export async function submitVideo(_prev: VideoState, formData: FormData): Promise<VideoState> {
  const me = await requireUser()
  const raw = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === 'string' && v !== ''))
  const parsed = submitSchema.safeParse(raw)
  if (!parsed.success) return { message: raw.consent ? 'Informations invalides.' : 'Coche la case de consentement.' }
  if (!(await limiter().limit('profileWrite', `u:${me.id}`)).success) return { message: 'Trop d’envois, réessaie dans une minute.' }
  const d = parsed.data

  const product = d.productSlug ? await db.product.findFirst({ where: { slug: d.productSlug, status: 'ACTIVE' }, select: { id: true } }) : null
  if (d.productSlug && !product) return { message: 'Produit introuvable.' }

  const autoApprove = hasRole(me.role, 'MODERATOR')
  let data: Prisma.SocialVideoUncheckedCreateInput
  if (d.kind === 'link') {
    const v = d.url ? parseVideoUrl(d.url) : null
    if (!v) return { message: 'Lien non reconnu. Colle le lien complet d’une vidéo TikTok, d’un Reel Instagram ou d’un Short YouTube.' }
    data = { platform: v.source, externalId: v.id, authorHandle: v.handle, submitterId: me.id }
  } else {
    const k = d.key ? parseKey(d.key) : null
    if (!k || k.kind !== 'videos' || k.ownerId !== me.id) return { message: 'Envoi invalide.' }
    const info = await objectSize(d.key!)
    if (!info || info.size > VIDEO_MAX_BYTES || !(await looksLikeVideo(d.key!))) {
      await deleteObject(d.key!)
      return { message: 'Le fichier envoyé n’est pas une vidéo valide.' }
    }
    data = { platform: 'UPLOAD', externalId: d.key!, contentType: info.contentType.slice(0, 40), sizeBytes: info.size, submitterId: me.id }
  }

  try {
    await db.socialVideo.create({
      data: { ...data, productId: product?.id ?? null, texture: d.texture ?? null, title: clean(d.caption), moderation: autoApprove ? 'APPROVED' : 'PENDING' },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return { message: 'Cette vidéo a déjà été ajoutée.' }
    throw err
  }
  if (d.path) revalidatePath(d.path)
  return { ok: true, message: autoApprove ? 'Vidéo publiée.' : 'Merci ! Ta vidéo sera visible après validation.' }
}

export async function moderateVideo(formData: FormData) {
  const me = await requireRole('MODERATOR', '/admin/videos')
  const parsed = z.object({ id: z.cuid(), decision: z.enum(['APPROVED', 'REJECTED']) }).safeParse({ id: formData.get('id'), decision: formData.get('decision') })
  if (!parsed.success) return
  const v = await db.socialVideo.update({ where: { id: parsed.data.id }, data: { moderation: parsed.data.decision }, select: { platform: true, externalId: true } })
  if (parsed.data.decision === 'REJECTED' && v.platform === 'UPLOAD') await deleteObject(v.externalId)
  await audit(me.id, `video.${parsed.data.decision.toLowerCase()}`, `video:${parsed.data.id}`)
  revalidatePath('/admin/videos')
}

export async function deleteMyVideo(formData: FormData) {
  const me = await requireUser()
  const id = z.cuid().safeParse(formData.get('id'))
  if (!id.success) return
  const v = await db.socialVideo.findFirst({ where: { id: id.data, submitterId: me.id }, select: { id: true, platform: true, externalId: true } })
  if (!v) return
  await db.socialVideo.delete({ where: { id: v.id } })
  if (v.platform === 'UPLOAD') await deleteObject(v.externalId)
  const path = formData.get('path')
  if (typeof path === 'string' && /^\/[a-z0-9/_.@-]{0,100}$/i.test(path)) revalidatePath(path)
}
