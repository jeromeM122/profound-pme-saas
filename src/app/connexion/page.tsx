import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
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
    <section className="mx-auto grid max-w-md gap-6 pt-10">
      <div className="grid gap-2 text-center">
        <h1 className="font-display text-3xl font-bold">Rejoins Tresser</h1>
        <p className="text-muted">Un clic, pas de mot de passe.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-clay-dark">
          {error}
        </p>
      )}

      <div className="card grid gap-4">
        {(providers.google || providers.apple) && (
          <form action={signInWithOAuth} className="grid gap-3">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            {providers.apple && (
              <button name="provider" value="apple" className="btn bg-cocoa text-white hover:bg-black">
                Continuer avec Apple
              </button>
            )}
            {providers.google && (
              <button name="provider" value="google" className="btn-outline">
                Continuer avec Google
              </button>
            )}
          </form>
        )}

        {providers.email && (
          <>
            {(providers.google || providers.apple) && (
              <div className="flex items-center gap-3 text-xs text-muted" aria-hidden>
                <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
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
          <p className="text-sm text-muted">Aucune méthode de connexion n’est configurée.</p>
        )}
      </div>

      <p className="text-center text-xs text-muted">
        En continuant, tu acceptes nos conditions d’utilisation et notre politique de confidentialité.
      </p>
    </section>
  )
}
