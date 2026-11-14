/**
 * Idempotent catalogue sync: brands, merchants, products and affiliate offers derived from the
 * community routines (src/content/catalog.ts). Safe to run on every deploy.
 */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { PRODUCTS, slugify } from '../src/content/catalog'

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })

async function main() {
  const brandIds = new Map<string, string>()
  const merchantIds = new Map<string, string>()

  for (const p of PRODUCTS) {
    const brandName = p.brand ?? 'Autres marques'
    let brandId = brandIds.get(brandName)
    if (!brandId) {
      const b = await db.brand.upsert({ where: { slug: slugify(brandName) }, create: { slug: slugify(brandName), name: brandName }, update: { name: brandName } })
      brandId = b.id
      brandIds.set(brandName, brandId)
    }

    const product = await db.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug, name: p.name, brandId, description: p.descriptor ?? '', images: p.image ? [p.image.src] : [],
        status: 'ACTIVE', textures: p.textures, goals: p.goals,
      },
      update: { name: p.name, brandId, images: p.image ? [p.image.src] : [], textures: p.textures, goals: p.goals },
    })

    if (p.offer) {
      let merchantId = merchantIds.get(p.offer.merchantSlug)
      if (!merchantId) {
        const hosts = [p.offer.host, `www.${p.offer.host}`]
        const m = await db.merchant.upsert({
          where: { slug: p.offer.merchantSlug },
          create: { slug: p.offer.merchantSlug, name: p.offer.merchantName, allowedHosts: hosts, subIdParam: '' },
          update: { name: p.offer.merchantName, allowedHosts: hosts },
        })
        merchantId = m.id
        merchantIds.set(p.offer.merchantSlug, merchantId)
      }
      await db.affiliateOffer.upsert({
        where: { id: p.offer.id },
        create: { id: p.offer.id, productId: product.id, merchantId, targetUrl: p.offer.url, active: true },
        update: { targetUrl: p.offer.url, active: true },
      })
    }
  }
  console.log(`✔ Catalogue synchronisé : ${PRODUCTS.length} produits, ${brandIds.size} marques, ${merchantIds.size} boutiques.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
