import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { SearchIcon, UserIcon } from '@/components/app/Icons'
import { auth } from '@/server/auth'

const navLink = 'text-[0.72rem] uppercase tracking-[0.14em] whitespace-nowrap text-encre transition-opacity hover:opacity-50'

export async function SiteHeader() {
  const session = await auth()
  const signedIn = Boolean(session?.user)
  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Mobile: centred wordmark, search on the right (navigation lives in the bottom bar) */}
      <div className="grid h-14 grid-cols-[2.5rem_1fr_2.5rem] items-center px-3 md:hidden">
        <span aria-hidden />
        <Link href="/" aria-label="tresser.fr — accueil" className="justify-self-center">
          <Logo height={18} />
        </Link>
        <Link href="/produits" aria-label="Rechercher un produit" className="grid size-10 place-items-center text-encre">
          <SearchIcon />
        </Link>
      </div>
      {/* Desktop: navigation left, wordmark centred, account right */}
      <div className="hidden h-20 grid-cols-[1fr_auto_1fr] items-center px-10 md:grid">
        <nav aria-label="Découvrir" className="flex items-center gap-9">
          <Link href="/scan" className={navLink}>Scan</Link>
          <Link href="/routines" className={navLink}>Routines</Link>
          <Link href="/produits" className={navLink}>Produits</Link>
          <Link href="/jumelles" className={navLink}>Jumelles</Link>
        </nav>
        <Link href="/" aria-label="tresser.fr — accueil" className="justify-self-center">
          <Logo height={24} />
        </Link>
        <nav aria-label="Compte" className="flex items-center justify-end gap-7">
          <Link href="/produits" aria-label="Rechercher" className="text-encre hover:opacity-50"><SearchIcon /></Link>
          <Link href="/ma-routine" className={navLink}>Ma routine</Link>
          <Link href={signedIn ? '/compte' : '/connexion'} aria-label={signedIn ? 'Mon compte' : 'Connexion'} className="text-encre hover:opacity-50">
            <UserIcon className="size-5" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
