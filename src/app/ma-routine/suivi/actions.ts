'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireUser } from '@/server/guards'
import { processPhoto } from '@/server/media/images'
import { newKey } from '@/server/media/keys'
import { deleteObject, putObject } from '@/server/media/storage'
import { limiter } from '@/server/security/ratelimit'

export type ProgressState = { ok?: boolean; message?: string }

const rating = z.preprocess((v) => (v === '' || v == null ? undefined : Number(v)), z.number().int().min(1).max(5).optional())
const schema = z.object({
  takenAt: z.iso.date().refine((d) => {
    const t = new Date(`${d}T12:00:00Z`).getTime()
    return t <= Date.now() + 86_400_000 && t >= Date.UTC(2000, 0, 1)
  }, 'Date invalide'),
  note: z.string().max(500).transform((s) => s.replace(/[\u0000-\u0009\u000B-\u001F\u007F‪-‮⁦-⁩]/g, '').trim()),
  hydration: rating,
  definition: rating,
  breakage: rating,
})

export async function addProgress(_prev: ProgressState, formData: FormData): Promise<ProgressState> {
  const me = await requireUser('/ma-routine/suivi')
  if (!(await limiter().limit('upload', `u:${me.id}`)).success) return { message: 'Trop d’envois, réessaie plus tard.' }
  const parsed = schema.safeParse({
    takenAt: formData.get('takenAt'),
    note: formData.get('note') ?? '',
    hydration: formData.get('hydration'),
    definition: formData.get('definition'),
    breakage: formData.get('breakage'),
  })
  if (!parsed.success) return { message: 'Vérifie la date et les champs.' }
  const file = formData.get('photo')
  if (!(file instanceof File) || file.size === 0) return { message: 'Ajoute une photo.' }
  const photo = await processPhoto(Buffer.from(await file.arrayBuffer()))
  if (!photo) return { message: 'Cette image n’a pas pu être lue (JPEG, PNG, WebP ou HEIC, 4 Mo max).' }

  const key = newKey('progress', me.id, 'webp')
  await putObject(key, photo.data, 'image/webp')
  try {
    await db.progressEntry.create({
      data: {
        userId: me.id,
        takenAt: new Date(`${parsed.data.takenAt}T00:00:00Z`),
        photoKey: key,
        width: photo.width,
        height: photo.height,
        note: parsed.data.note || null,
        hydration: parsed.data.hydration ?? null,
        definition: parsed.data.definition ?? null,
        breakage: parsed.data.breakage ?? null,
      },
    })
  } catch (err) {
    await deleteObject(key)
    throw err
  }
  revalidatePath('/ma-routine/suivi')
  return { ok: true, message: 'Photo ajoutée à ton suivi.' }
}

export async function deleteProgress(formData: FormData) {
  const me = await requireUser('/ma-routine/suivi')
  const id = z.cuid().safeParse(formData.get('id'))
  if (!id.success) return
  const entry = await db.progressEntry.findFirst({ where: { id: id.data, userId: me.id }, select: { id: true, photoKey: true } })
  if (!entry) return
  await db.progressEntry.delete({ where: { id: entry.id } })
  await deleteObject(entry.photoKey)
  revalidatePath('/ma-routine/suivi')
}
