import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Wave } from '@/components/brand/Wave'
import { Avatar } from '@/components/profile/Avatar'
import { FollowButton } from '@/components/profile/FollowButton'
import { HairBadge } from '@/components/profile/HairBadge'
import { canonicalSocialUrl, SOCIAL_LABEL } from '@/lib/social/parse'
import { auth } from '@/server/auth'
import { getPublicProfile, isFollowing } from '@/server/social/graph'

type Props = { params: Promise<{ handle: string }> }

const HANDLE_RE = /^[a-z0-9_.]{3,30}$/
const STATUS_LABEL = { USING: 'J’utilise', TRIED: 'Testé', WISHLIST: 'À tester' } as const

async function load(raw: string) {
  let handle: string
  try {
    handle = decodeURIComponent(raw).replace(/^@/, '').toLowerCase()
  } catch {
    return null
  }
  if (!HANDLE_RE.test(handle)) return null
  const [profile, session] = await Promise.all([getPublicProfile(handle), auth()])
  if (!profile) return null
  const isOwner = session?.user?.id === profile.id
  if (!profile.isPublic && !isOwner) return null
  return { profile, viewerId: session?.user?.id ?? null, isOwner }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).handle)
  if (!data) return { title: 'Profil introuvable', robots: { index: false } }
  const { profile } = data
  return {
    title: `${profile.name || profile.handle} (@${profile.handle})`,
    description: profile.bio?.slice(0, 150) || `Le profil capillaire de @${profile.handle} sur tresser.fr`,
    robots: { index: profile.isPublic },
  }
}

export default async function MemberPage({ params }: Props) {
  const data = await load((await params).handle)
  if (!data) notFound()
  const { profile: p, viewerId, isOwner } = data
  const following = viewerId && !isOwner ? await isFollowing(viewerId, p.id) : false
  const path = `/@${p.handle}`
  const hp = p.hairProfile

  return (
    <div className="px-4 pt-28 pb-24">
      {!p.isPublic && isOwner && (
        <p className="mx-auto mb-6 max-w-5xl rounded-lg bg-citron px-4 py-3 text-sm font-bold text-noir">
          Ton profil est privé : toi seule le vois. Rends-le public depuis ton compte.
        </p>
      )}
      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[auto_1fr] md:items-center">
        <Avatar name={p.name} handle={p.handle} size="xl" />
        <div className="grid gap-4">
          <div>
            <h1 className="display text-5xl sm:text-7xl">{p.name || p.handle}</h1>
            <p className="font-mono text-gris">@{p.handle}</p>
          </div>
          {hp?.badgePublic && <HairBadge texture={hp.texture} porosity={hp.porosity} goals={hp.goals} />}
          {p.bio && <p className="max-w-xl whitespace-pre-line text-lg text-ivoire/80">{p.bio}</p>}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p>
              <span className="text-xl font-bold">{p._count.followers}</span> <span className="text-gris">abonné·es</span>
            </p>
            <p>
              <span className="text-xl font-bold">{p._count.following}</span> <span className="text-gris">abonnements</span>
            </p>
            {isOwner ? (
              <Link href="/compte" className="btn-ghost min-h-10 px-4">
                Modifier mon profil
              </Link>
            ) : viewerId ? (
              <FollowButton targetId={p.id} following={following} path={path} compact />
            ) : (
              <Link href={`/connexion?callbackUrl=${encodeURIComponent(path)}` as '/connexion'} className="btn-primary min-h-10 px-4">
                Suivre
              </Link>
            )}
          </div>
          {p.socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {p.socialLinks.map((s) => {
                const url = canonicalSocialUrl(s.platform, s.handle)
                return url ? (
                  <li key={s.platform}>
                    <a href={url} target="_blank" rel="me noopener noreferrer nofollow ugc" className="inline-flex items-center gap-2 rounded-full border border-ivoire/20 px-4 py-2 text-sm hover:border-citron hover:text-citron">
                      <span className="font-bold">{SOCIAL_LABEL[s.platform]}</span>
                      <span className="font-mono text-gris">@{s.handle}</span>
                    </a>
                  </li>
                ) : null
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-5xl gap-6">
        <div className="flex items-center gap-4">
          <h2 className="display text-4xl sm:text-5xl">
            Ma salle <span className="accent">de bain</span>
          </h2>
          <Wave name="tight" width={100} className="hidden text-citron sm:block" />
        </div>
        {p.bathroom.length === 0 ? (
          <p className="card text-gris">{isOwner ? 'Ajoute bientôt les produits que tu utilises depuis le catalogue.' : 'Aucun produit partagé pour l’instant.'}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {p.bathroom.map((b) => (
              <li key={b.product.slug} className="card grid gap-2">
                <p className="kicker text-gris">{b.product.brand.name}</p>
                <p className="text-lg font-bold">{b.product.name}</p>
                <p className="text-sm">
                  {STATUS_LABEL[b.status]}
                  {b.rating ? ` · ${'★'.repeat(b.rating)}${'☆'.repeat(5 - b.rating)}` : ''}
                  {b.recommended ? ' · Recommandé' : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
