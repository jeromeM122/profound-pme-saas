import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { SearchIcon } from '@/components/app/Icons'
import { auth } from '@/server/auth'

const navLink = 'kicker whitespace-nowrap text-encre/80 transition-colors hover:text-or'

export async function SiteHeader() {
  const session = await auth()
  const signedIn = Boolean(session?.user)
  return (
    <header className="sticky top-0 z-40 border-b border-ligne bg-creme/90 backdrop-blur">
      {/* Mobile: app bar — wordmark + search (navigation lives in the bottom tab bar) */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden">
        <Link href="/" aria-label="tresser.fr — accueil" className="p-1">
          <Logo height={20} />
        </Link>
        <Link href="/produits" aria-label="Rechercher un produit" className="grid size-10 place-items-center rounded-full border border-ligne bg-perle text-encre">
          <SearchIcon />
        </Link>
      </div>
      {/* Desktop */}
      <div className="mx-auto hidden max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-8 py-5 md:grid">
        <nav aria-label="Découvrir" className="flex items-center gap-8">
          <Link href="/routines" className={navLink}>Routines</Link>
          <Link href="/produits" className={navLink}>Produits</Link>
          <Link href="/jumelles" className={navLink}>Jumelles</Link>
        </nav>
        <Link href="/" aria-label="tresser.fr — accueil" className="justify-self-center p-1">
          <Logo height={22} />
        </Link>
        <nav aria-label="Compte" className="flex items-center justify-end gap-6">
          <Link href="/ma-routine" className={navLink}>Ma routine</Link>
          <Link href={signedIn ? '/compte' : '/connexion'} className={navLink}>{signedIn ? 'Mon compte' : 'Connexion'}</Link>
          <Link href="/scan" className="btn-primary min-h-10 px-5">Scanner mes cheveux</Link>
        </nav>
      </div>
    </header>
  )
}
