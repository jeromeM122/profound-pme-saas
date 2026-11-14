'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getProduct } from '@/content/catalog'
import { classifyProduct, STEP_ORDER } from '@/content/regimen'
import { db } from '@/server/db'
import { requireUser } from '@/server/guards'
import { limiter } from '@/server/security/ratelimit'

const slug = z.string().regex(/^[a-z0-9-]{1,90}$/)

async function guard() {
  const me = await requireUser('/ma-routine')
  return { me, ok: (await limiter().limit('profileWrite', `u:${me.id}`)).success }
}

/** Choose another product for one step of « Ma routine ». */
export async function chooseProduct(formData: FormData) {
  const parsed = z.object({ step: z.enum(STEP_ORDER as [string, ...string[]]), slug }).safeParse({ step: formData.get('step'), slug: formData.get('slug') })
  if (!parsed.success) return
  const { me, ok } = await guard()
  if (!ok) return
  const catalog = getProduct(parsed.data.slug)
  if (!catalog || classifyProduct(catalog) !== parsed.data.step) return // a product can only fill its own step
  const product = await db.product.findFirst({ where: { slug: parsed.data.slug, status: 'ACTIVE' }, select: { id: true } })
  if (!product) return
  const step = parsed.data.step as (typeof STEP_ORDER)[number]
  await db.routineChoice.upsert({
    where: { userId_step: { userId: me.id, step } },
    create: { userId: me.id, step, productId: product.id },
    update: { productId: product.id },
  })
  revalidatePath('/ma-routine')
}

/** « Je l'ai déjà » — toggles the product in the member's bathroom (status USING). */
export async function toggleOwned(formData: FormData) {
  const parsed = slug.safeParse(formData.get('slug'))
  if (!parsed.success) return
  const { me, ok } = await guard()
  if (!ok) return
  const product = await db.product.findFirst({ where: { slug: parsed.data, status: 'ACTIVE' }, select: { id: true } })
  if (!product) return
  const key = { userId_productId: { userId: me.id, productId: product.id } }
  const existing = await db.bathroomItem.findUnique({ where: key, select: { status: true } })
  if (existing?.status === 'USING') await db.bathroomItem.delete({ where: key })
  else await db.bathroomItem.upsert({ where: key, create: { userId: me.id, productId: product.id, status: 'USING' }, update: { status: 'USING' } })
  revalidatePath('/ma-routine')
}
