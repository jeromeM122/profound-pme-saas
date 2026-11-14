import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { auth } from '@/server/auth'

const navLink = 'kicker text-encre/80 transition-colors hover:text-or'

export async function SiteHeader() {
  const session = await auth()
  const signedIn = Boolean(session?.user)
  return (
    <header className="sticky top-0 z-40">
      {/* Announcement bar */}
      <div className="bg-encre px-4 py-2 text-center">
        <p className="kicker text-[0.62rem] text-creme/85">
          Diagnostic capillaire offert<span className="hidden sm:inline"> · Conseils sur-mesure · Communauté</span>
        </p>
      </div>
      <div className="border-b border-ligne bg-creme/95 backdrop-blur">
        {/* py-5 ≥ « 1e » clear space around the wordmark */}
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-5 sm:px-8">
          <nav aria-label="Découvrir" className="hidden items-center gap-8 md:flex">
            <Link href="/routines" className={navLink}>
              Routines
            </Link>
            <Link href="/produits" className={navLink}>
              Produits
            </Link>
            <Link href="/diagnostic" className={navLink}>
              Diagnostic
            </Link>
            <Link href="/jumelles" className={navLink}>
              Jumelles
            </Link>
          </nav>
          <Link href="/" aria-label="tresser.fr — accueil" className="col-start-1 justify-self-start p-1 md:col-start-2 md:justify-self-center">
            <Logo height={22} />
          </Link>
          <nav aria-label="Compte" className="col-start-3 flex items-center justify-end gap-6">
            <Link href="/routines" className={`${navLink} md:hidden`}>
              Routines
            </Link>
            <Link href={signedIn ? '/compte' : '/connexion'} className={navLink}>
              {signedIn ? 'Mon compte' : 'Connexion'}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
