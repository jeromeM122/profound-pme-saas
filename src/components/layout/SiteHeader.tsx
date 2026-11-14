import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { auth } from '@/server/auth'

export async function SiteHeader() {
  const session = await auth()
  return (
    <header className="sticky top-0 z-40 border-b-2 border-noir bg-blanc">
      {/* py-4 ≥ « 1e » clear space around the 24 px wordmark */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="tresser.fr — accueil" className="px-2">
          <Logo height={24} title="tresser.fr" />
        </Link>
        <nav aria-label="Compte">
          {session?.user ? (
            <Link href="/compte" className="kicker font-bold hover:bg-citron">
              Mon compte
            </Link>
          ) : (
            <Link href="/connexion" className="btn-primary min-h-10 px-4 text-sm">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
