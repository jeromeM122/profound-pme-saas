import type { Metadata } from 'next'
import Link from 'next/link'
import { Avatar } from '@/components/profile/Avatar'
import { FollowButton } from '@/components/profile/FollowButton'
import { HairBadge } from '@/components/profile/HairBadge'
import { ButtonLabel } from '@/components/ui/ButtonLabel'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { getCurrentDiagnostic } from '@/server/hair/profile'
import { findTwins } from '@/server/social/graph'

export const metadata: Metadata = { title: 'Mes jumelles capillaires', robots: { index: false } }

export default async function JumellesPage() {
  const session = await auth()
  const me = session?.user?.id ?? null
  const d = await getCurrentDiagnostic(me)

  if (!d) {
    return (
      <section className="mx-auto grid max-w-xl justify-items-center gap-6 px-4 pt-20 pb-24 text-center">
        <h1 className="display text-5xl">
          Tes <span className="accent">jumelles</span>
        </h1>
        <p className="text-lg text-encre/80">Fais ton diagnostic pour trouver les membres qui ont exactement ton profil capillaire.</p>
        <Link href="/diagnostic" className="btn-primary">
          <ButtonLabel>Faire mon diagnostic</ButtonLabel>
        </Link>
      </section>
    )
  }

  const twins = await findTwins(d.twinKey, me)
  const followed = me
    ? new Set((await db.follow.findMany({ where: { followerId: me, followingId: { in: twins.map((t) => t.id) } }, select: { followingId: true } })).map((f) => f.followingId))
    : new Set<string>()

  return (
    <div className="px-4 pt-14 pb-24">
      <section className="mx-auto grid max-w-6xl gap-4">
        <p className="kicker text-taupe">Même texture, même porosité</p>
        <h1 className="display text-5xl sm:text-7xl">
          Mes <span className="accent">jumelles</span>
        </h1>
        <p className="w-fit bg-champagne px-3 py-2 font-mono text-sm font-normal text-encre">{d.badge}</p>
      </section>

      <section className="mx-auto mt-12 max-w-6xl">
        {twins.length === 0 ? (
          <div className="card grid gap-3">
            <p className="text-lg font-normal">Personne n’affiche encore ce profil.</p>
            <p className="text-taupe">Rends ton profil et ton badge publics pour que tes futures jumelles te trouvent.</p>
            {me && (
              <Link href="/compte" className="btn-ghost w-fit">
                Mon profil
              </Link>
            )}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {twins.map((t) => (
              <li key={t.id} className="card grid gap-4">
                <Link href={`/@${t.handle}` as '/'} className="flex items-center gap-3 hover:text-or">
                  <Avatar name={t.name} handle={t.handle} />
                  <span className="grid">
                    <span className="font-normal">{t.name || t.handle}</span>
                    <span className="font-mono text-sm text-taupe">@{t.handle}</span>
                  </span>
                </Link>
                {t.hairProfile && <HairBadge texture={t.hairProfile.texture} porosity={t.hairProfile.porosity} goals={t.hairProfile.goals} size="sm" />}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-taupe">{t._count.followers} abonné·es</p>
                  {me ? (
                    <FollowButton targetId={t.id} following={followed.has(t.id)} path="/jumelles" compact />
                  ) : (
                    <Link href="/connexion?callbackUrl=%2Fjumelles" className="btn-primary min-h-10 px-4">
                      Suivre
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
