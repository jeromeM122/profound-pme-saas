import Link from 'next/link'
import { auth } from '@/server/auth'

export async function SiteHeader() {
  const session = await auth()
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-clay">
          tresser
        </Link>
        <nav aria-label="Compte">
          {session?.user ? (
            <Link href="/compte" className="text-sm font-semibold">
              Mon compte
            </Link>
          ) : (
            <Link href="/connexion" className="text-sm font-semibold">
              Se connecter
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
