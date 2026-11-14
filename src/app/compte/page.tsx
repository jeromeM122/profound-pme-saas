import type { Metadata } from 'next'
import Link from 'next/link'
import { HairBadge } from '@/components/profile/HairBadge'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { SocialLinksForm } from '@/components/profile/SocialLinksForm'
import { ButtonLabel } from '@/components/ui/ButtonLabel'
import type { SocialPlatform } from '@/generated/prisma/enums'
import { canonicalSocialUrl } from '@/lib/social/parse'
import { db } from '@/server/db'
import { requireUser } from '@/server/guards'
import { deleteDiagnostic, logout } from './actions'

export const metadata: Metadata = { title: 'Mon compte', robots: { index: false } }

const ROLE_LABEL = { USER: 'Membre', CREATOR: 'Créatrice', MODERATOR: 'Modération', ADMIN: 'Administration' } as const

export default async function ComptePage() {
  const me = await requireUser('/compte')
  const user = await db.user.findUniqueOrThrow({
    where: { id: me.id },
    select: {
      email: true,
      handle: true,
      name: true,
      bio: true,
      isPublic: true,
      role: true,
      hairProfile: { select: { texture: true, porosity: true, goals: true, badgePublic: true } },
      socialLinks: { select: { platform: true, handle: true } },
      _count: { select: { followers: true, following: true } },
    },
  })
  const links: Partial<Record<SocialPlatform, { handle: string; url: string }>> = {}
  for (const l of user.socialLinks) {
    const url = canonicalSocialUrl(l.platform, l.handle)
    if (url) links[l.platform] = { handle: l.handle, url }
  }
  const hp = user.hairProfile

  return (
    <div className="px-4 pt-14 pb-24">
      <section className="mx-auto grid max-w-5xl gap-3">
        <p className="kicker text-taupe">{ROLE_LABEL[user.role]}</p>
        <h1 className="display text-5xl sm:text-7xl">
          Mon <span className="accent">compte</span>
        </h1>
        <p className="text-taupe">
          {user.email} · {user._count.followers} abonné·es · {user._count.following} abonnements
        </p>
        {user.handle && (
          <Link href={`/@${user.handle}` as '/'} className="w-fit font-mono text-or underline underline-offset-4">
            tresser.fr/@{user.handle}
          </Link>
        )}
      </section>

      <div className="mx-auto mt-12 grid max-w-5xl gap-3 lg:grid-cols-[1.2fr_1fr]">
        <section className="card grid content-start gap-6" aria-labelledby="profil-title">
          <h2 id="profil-title" className="text-xl font-normal uppercase">
            Profil public
          </h2>
          <ProfileForm
            hasDiagnostic={!!hp}
            defaults={{ handle: user.handle ?? '', name: user.name ?? '', bio: user.bio ?? '', isPublic: user.isPublic, badgePublic: hp?.badgePublic ?? false }}
          />
        </section>

        <div className="grid content-start gap-3">
          <section className="grid gap-4 bg-champagne p-6 text-encre" aria-labelledby="diag-title">
            <h2 id="diag-title" className="text-xl font-normal uppercase">
              Mon diagnostic
            </h2>
            {hp ? (
              <>
                <div className="bg-encre p-1 w-fit">
                  <HairBadge texture={hp.texture} porosity={hp.porosity} goals={hp.goals} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/diagnostic/resultat" className="btn-dark">
                    <ButtonLabel>Voir</ButtonLabel>
                  </Link>
                  <Link href="/ma-routine/suivi" className="btn-dark">
                    <ButtonLabel>Mon suivi</ButtonLabel>
                  </Link>
                  <Link href="/jumelles" className="btn-dark">
                    <ButtonLabel>Mes jumelles</ButtonLabel>
                  </Link>
                  <Link href="/diagnostic" className="btn border border-encre/40 hover:bg-encre hover:text-or">
                    <ButtonLabel>Refaire</ButtonLabel>
                  </Link>
                </div>
                <form action={deleteDiagnostic}>
                  <button className="text-sm underline underline-offset-4">Supprimer mes données capillaires</button>
                </form>
              </>
            ) : (
              <>
                <p>Pas encore de diagnostic : 60 secondes pour un profil sur-mesure.</p>
                <Link href="/diagnostic" className="btn-dark w-fit">
                  <ButtonLabel>Faire mon diagnostic</ButtonLabel>
                </Link>
              </>
            )}
          </section>

          <section className="card grid gap-4" aria-labelledby="social-title">
            <h2 id="social-title" className="text-xl font-normal uppercase">
              Réseaux sociaux
            </h2>
            <SocialLinksForm links={links} />
          </section>

          <form action={logout}>
            <button className="btn-ghost">Se déconnecter</button>
          </form>
        </div>
      </div>
    </div>
  )
}
