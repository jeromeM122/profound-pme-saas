import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Wave } from '@/components/brand/Wave'
import { callbackUrlSchema } from '@/lib/validators/auth'
import { auth, enabledProviders } from '@/server/auth'
import { requestMagicLink, signInWithOAuth } from './actions'

export const metadata: Metadata = { title: 'Connexion', robots: { index: false } }

const ERRORS: Record<string, string> = {
  InvalidEmail: 'Cette adresse e-mail ne semble pas valide.',
  RateLimited: 'Trop de tentatives. Réessaie dans quelques minutes.',
  Verification: 'Ce lien a expiré ou a déjà été utilisé. Demande-en un nouveau.',
  OAuthAccountNotLinked: 'Cette adresse est déjà associée à une autre méthode de connexion.',
  AccessDenied: 'Connexion refusée.',
  Configuration: 'Cette méthode de connexion est momentanément indisponible.',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ConnexionPage({ searchParams }: Props) {
  const sp = await searchParams
  const callbackUrl = callbackUrlSchema.parse(typeof sp.callbackUrl === 'string' ? sp.callbackUrl : '/compte')
  if ((await auth())?.user) redirect(callbackUrl as '/compte')

  const errorKey = typeof sp.error === 'string' ? sp.error : undefined
  const error = errorKey ? (ERRORS[errorKey] ?? 'Une erreur est survenue. Réessaie.') : undefined
  const providers = enabledProviders()

  return (
    <section className="mx-auto grid max-w-md gap-6 px-4 pt-16 pb-16">
      <div className="grid justify-items-center gap-3 text-center">
        <p className="kicker">Bienvenue</p>
        <h1 className="display text-4xl sm:text-5xl">Rejoins la communauté</h1>
        <Wave name="curl" width={160} className="text-or" />
        <p className="text-taupe">Un clic, pas de mot de passe.</p>
      </div>

      {error && (
        <p role="alert" className="bg-champagne px-4 py-3 text-sm font-normal text-encre">
          {error}
        </p>
      )}

      <div className="card grid gap-4">
        {(providers.google || providers.apple) && (
          <form action={signInWithOAuth} className="grid gap-3">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            {providers.apple && (
              <button name="provider" value="apple" className="btn-primary">
                Continuer avec Apple
              </button>
            )}
            {providers.google && (
              <button name="provider" value="google" className="btn-ghost">
                Continuer avec Google
              </button>
            )}
          </form>
        )}

        {providers.email && (
          <>
            {(providers.google || providers.apple) && (
              <div className="flex items-center gap-3 text-xs text-taupe" aria-hidden>
                <span className="h-px flex-1 bg-encre/10" /> ou <span className="h-px flex-1 bg-encre/10" />
              </div>
            )}
            <form action={requestMagicLink} className="grid gap-3">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <label htmlFor="email" className="text-sm font-semibold">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                inputMode="email"
                placeholder="toi@exemple.fr"
                className="field"
              />
              <button className="btn-primary">Recevoir mon lien magique</button>
            </form>
          </>
        )}

        {!providers.email && !providers.google && !providers.apple && (
          <p className="text-sm text-taupe">Aucune méthode de connexion n’est configurée.</p>
        )}
      </div>

      <p className="text-center text-xs text-taupe">
        En continuant, tu acceptes nos conditions d’utilisation et notre politique de confidentialité.
      </p>
    </section>
  )
}
