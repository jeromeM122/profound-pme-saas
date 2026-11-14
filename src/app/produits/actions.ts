'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireUser } from '@/server/guards'
import { limiter } from '@/server/security/ratelimit'

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,90}$/),
  status: z.enum(['USING', 'WISHLIST', 'REMOVE']),
})

/** Add / move / remove a product in « Ma salle de bain ». */
export async function setBathroomStatus(formData: FormData) {
  const parsed = schema.safeParse({ slug: formData.get('slug'), status: formData.get('status') })
  if (!parsed.success) return
  const me = await requireUser(`/produits/${parsed.data.slug}`)
  if (!(await limiter().limit('profileWrite', `u:${me.id}`)).success) return
  const product = await db.product.findFirst({ where: { slug: parsed.data.slug, status: 'ACTIVE' }, select: { id: true } })
  if (!product) return
  const key = { userId_productId: { userId: me.id, productId: product.id } }
  if (parsed.data.status === 'REMOVE') await db.bathroomItem.deleteMany({ where: { userId: me.id, productId: product.id } })
  else await db.bathroomItem.upsert({ where: key, create: { userId: me.id, productId: product.id, status: parsed.data.status }, update: { status: parsed.data.status } })
  revalidatePath(`/produits/${parsed.data.slug}`)
  if (me.handle) revalidatePath(`/membre/${me.handle}`)
}
