import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/products/ProductCard'
import { BuyButton } from '@/components/routines/BuyButton'
import { MatchBadge } from '@/components/routines/MatchBadge'
import { getProduct, PRODUCTS } from '@/content/catalog'
import { CATEGORY_LABEL, getRoutine, scoreFit } from '@/content/routines'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { getVisitorProfile } from '@/server/hair/visitor-profile'
import { setBathroomStatus } from '../actions'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug)
  if (!p) return { title: 'Produit introuvable', robots: { index: false } }
  return {
    title: `${p.name}${p.brand ? ` — ${p.brand}` : ''}`,
    description: `Utilisé dans ${p.usages.length} routine${p.usages.length > 1 ? 's' : ''} de la communauté tresser.fr. Avis, conseils d’utilisation et où l’acheter.`,
    openGraph: p.image ? { images: [{ url: p.image.src, width: p.image.w, height: p.image.h }] } : undefined,
  }
}

export default async function ProduitPage({ params }: Props) {
  const p = getProduct((await params).slug)
  if (!p) notFound()
  const from = `/produits/${p.slug}`
  const [profile, session] = await Promise.all([getVisitorProfile(), auth()])
  const match = profile ? scoreFit({ textures: p.textures, goals: p.goals, porosity: null }, profile) : null
  const dbProduct = await db.product.findUnique({
    where: { slug: p.slug },
    select: {
      id: true,
      _count: { select: { bathroom: { where: { moderation: 'APPROVED' } } } },
      bathroom: session?.user?.id ? { where: { userId: session.user.id }, select: { status: true } } : false,
    },
  })
  const mine = dbProduct && 'bathroom' in dbProduct && Array.isArray(dbProduct.bathroom) ? dbProduct.bathroom[0]?.status : undefined
  const members = dbProduct?._count.bathroom ?? 0
  const related = PRODUCTS.filter((x) => x.slug !== p.slug && x.categories.some((c) => p.categories.includes(c)))
    .map((x) => ({ x, m: profile ? scoreFit({ textures: x.textures, goals: x.goals, porosity: null }, profile) : null }))
    .sort((a, b) => (b.m?.score ?? 0) - (a.m?.score ?? 0) || b.x.usages.length - a.x.usages.length)
    .slice(0, 4)

  const bathroomButton = (status: 'USING' | 'WISHLIST', label: string) => (
    <form action={setBathroomStatus}>
      <input type="hidden" name="slug" value={p.slug} />
      <input type="hidden" name="status" value={mine === status ? 'REMOVE' : status} />
      <button aria-pressed={mine === status} className={`kicker border px-4 py-3 text-[0.6rem] transition-colors ${mine === status ? 'border-or bg-champagne' : 'border-ligne hover:border-or hover:text-or'}`}>
        {mine === status ? '✓ ' : ''}
        {label}
      </button>
    </form>
  )

  return (
    <div className="pb-24 lg:pb-0">
      <nav aria-label="Fil d’Ariane" className="kicker mx-auto max-w-7xl px-4 pt-8 text-[0.58rem] text-taupe sm:px-8">
        <Link href="/produits" className="hover:text-or">Produits</Link>
        {p.categories[0] && <> / {CATEGORY_LABEL[p.categories[0]]}</>}
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-6 pb-20 sm:px-8 md:grid-cols-2 md:gap-16">
        <div className="bg-perle">
          {p.image && <Image src={p.image.src} width={p.image.w} height={p.image.h} alt={p.name} priority sizes="(min-width: 768px) 45vw, 100vw" className="aspect-square w-full object-cover" />}
        </div>

        <div className="grid content-start gap-6">
          <div className="grid gap-3">
            <p className="kicker text-or">{p.brand ?? 'Sélection de la communauté'}</p>
            <h1 className="display text-3xl sm:text-5xl">{p.name}</h1>
            {p.descriptor && <p className="text-taupe">{p.descriptor}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {match ? (
              <MatchBadge match={match} />
            ) : (
              <Link href="/diagnostic" className="kicker border-b border-encre/40 pb-1 text-[0.6rem] hover:border-or hover:text-or">
                Est-il fait pour moi ? Fais le test →
              </Link>
            )}
            <p className="kicker text-[0.58rem] text-taupe">
              Dans {p.usages.length} routine{p.usages.length > 1 ? 's' : ''}
              {members > 0 ? ` · dans ${members} salle${members > 1 ? 's' : ''} de bain` : ''}
            </p>
          </div>

          {/* Where to buy */}
          <section aria-labelledby="ou-acheter" className="grid gap-4 border border-ligne bg-perle p-6">
            <h2 id="ou-acheter" className="kicker text-[0.62rem] text-encre">Où l’acheter</h2>
            {p.offer ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg">{p.offer.merchantName}</p>
                    <p className="text-xs text-taupe">{p.offer.isBrandShop ? 'Boutique officielle de la marque' : 'Revendeur'} · livraison et prix sur le site</p>
                  </div>
                  <BuyButton offer={p.offer} from={from} />
                </div>
                <p className="text-xs leading-relaxed text-taupe">Tu seras redirigé·e vers {p.offer.host} dans un nouvel onglet.</p>
              </>
            ) : (
              <p className="text-sm text-taupe">Aucune boutique référencée pour l’instant. Tu l’achètes ailleurs ? Partage ta routine pour aider la communauté.</p>
            )}
          </section>

          {/* Bathroom */}
          <div className="grid gap-3">
            <p className="kicker text-[0.58rem] text-taupe">Ma salle de bain</p>
            {session?.user ? (
              <div className="flex flex-wrap gap-2">
                {bathroomButton('USING', 'Je l’utilise')}
                {bathroomButton('WISHLIST', 'Je veux le tester')}
              </div>
            ) : (
              <Link href={`/connexion?callbackUrl=${encodeURIComponent(from)}` as '/connexion'} className="kicker w-fit border-b border-encre/40 pb-1 text-[0.6rem] hover:border-or hover:text-or">
                Connecte-toi pour l’ajouter à ta salle de bain
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-perle px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="display mb-10 text-3xl sm:text-4xl">
            Ce qu’en dit <span className="accent">la communauté</span>
          </h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {p.usages.map((u) => {
              const r = getRoutine(u.routineSlug)
              return (
                <li key={`${u.routineSlug}-${u.step}`} className="grid content-between gap-5 border-l border-or-clair bg-creme p-6">
                  {u.text[0] ? (
                    <blockquote className="text-lg leading-relaxed font-light">« {u.text[0]} »</blockquote>
                  ) : (
                    <p className="text-lg leading-relaxed font-light text-taupe">Utilisé par {u.routineName} à l’étape {u.step} de sa routine{u.stepName ? ` (${u.stepName.toLowerCase()})` : ''}.</p>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <p className="kicker text-[0.58rem] text-taupe">
                      {u.routineName} · étape {u.step}
                      {r?.categories[0] ? ` · ${CATEGORY_LABEL[r.categories[0]]}` : ''}
                    </p>
                    <Link href={`/routines/${u.routineSlug}` as '/routines'} className="kicker text-[0.58rem] text-or hover:underline">
                      Sa routine →
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
          <h2 className="display mb-10 text-3xl">
            {profile ? 'Aussi pour ' : 'Souvent '}
            <span className="accent">{profile ? 'ton profil' : 'associés'}</span>
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {related.map(({ x, m }) => (
              <li key={x.slug}>
                <ProductCard product={x} match={m} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.offer && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ligne bg-creme/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm">{p.name}</p>
              <p className="kicker text-[0.55rem] text-taupe">{p.offer.merchantName}{match ? ` · ${match.score} % pour toi` : ''}</p>
            </div>
            <BuyButton offer={p.offer} from={from} className="min-h-11 shrink-0 px-5" compact />
          </div>
        </div>
      )}
    </div>
  )
}
