'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { SocialPlatform } from '@/generated/prisma/enums'
import { Prisma } from '@/generated/prisma/client'
import { profileFormSchema } from '@/lib/validators/auth'
import { parseSocialProfile, SOCIAL_LABEL } from '@/lib/social/parse'
import { signOut } from '@/server/auth'
import { db } from '@/server/db'
import { requireUser } from '@/server/guards'
import { deleteHairProfile } from '@/server/hair/profile'
import { limiter } from '@/server/security/ratelimit'

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> }

async function guard() {
  const me = await requireUser()
  const r = await limiter().limit('profileWrite', `u:${me.id}`)
  return { me, limited: !r.success }
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { me, limited } = await guard()
  if (limited) return { message: 'Trop de modifications, réessaie dans une minute.' }

  const parsed = profileFormSchema.safeParse({
    handle: formData.get('handle') ?? '',
    name: formData.get('name') ?? '',
    bio: formData.get('bio') ?? '',
    isPublic: formData.get('isPublic') === 'on',
    badgePublic: formData.get('badgePublic') === 'on',
  })
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message
    return { errors }
  }
  const { handle, name, bio, isPublic, badgePublic } = parsed.data
  try {
    await db.$transaction([
      db.user.update({ where: { id: me.id }, data: { handle, name: name || null, bio: bio || null, isPublic } }),
      db.hairProfile.updateMany({ where: { userId: me.id }, data: { badgePublic } }),
    ])
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return { errors: { handle: 'Ce pseudo est déjà pris' } }
    throw err
  }
  revalidatePath('/compte')
  revalidatePath(`/membre/${handle}`)
  return { ok: true, message: 'Profil enregistré.' }
}

const platformSchema = z.enum(SocialPlatform)

export async function saveSocialLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const { me, limited } = await guard()
  if (limited) return { message: 'Trop de modifications, réessaie dans une minute.' }
  const platform = platformSchema.safeParse(formData.get('platform'))
  if (!platform.success) return { message: 'Réseau inconnu.' }
  const parsed = parseSocialProfile(platform.data, String(formData.get('value') ?? ''))
  if (!parsed) return { errors: { [platform.data]: `Lien ou @pseudo ${SOCIAL_LABEL[platform.data]} invalide.` } }
  await db.socialLink.upsert({
    where: { userId_platform: { userId: me.id, platform: parsed.platform } },
    create: { userId: me.id, platform: parsed.platform, handle: parsed.handle },
    update: { handle: parsed.handle, displayName: null, avatarUrl: null, fetchedAt: null },
  })
  revalidatePath('/compte')
  return { ok: true, message: `${SOCIAL_LABEL[parsed.platform]} ajouté : @${parsed.handle}` }
}

export async function removeSocialLink(formData: FormData) {
  const { me, limited } = await guard()
  if (limited) return
  const platform = platformSchema.safeParse(formData.get('platform'))
  if (!platform.success) return
  await db.socialLink.deleteMany({ where: { userId: me.id, platform: platform.data } })
  revalidatePath('/compte')
}

export async function deleteDiagnostic() {
  const { me } = await guard()
  await deleteHairProfile(me.id)
  revalidatePath('/compte')
}

export async function logout() {
  await signOut({ redirectTo: '/' })
}
