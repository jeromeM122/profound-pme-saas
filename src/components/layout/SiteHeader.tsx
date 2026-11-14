import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { ButtonLabel } from '@/components/ui/ButtonLabel'
import { auth } from '@/server/auth'

export async function SiteHeader() {
  const session = await auth()
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-noir/90 to-transparent">
      {/* padding ≥ « 1e » clear space around the wordmark */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" aria-label="tresser.fr — accueil" className="p-1">
          <Logo tone="blanc" height={24} />
        </Link>
        <nav aria-label="Principale" className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link href="/jumelles" className="hidden px-3 text-sm font-bold uppercase hover:text-citron sm:block">
                Jumelles
              </Link>
              <Link href="/compte" className="btn-ghost min-h-10 px-4">
                <ButtonLabel>Mon compte</ButtonLabel>
              </Link>
            </>
          ) : (
            <>
              <Link href="/diagnostic" className="hidden px-3 text-sm font-bold uppercase hover:text-citron sm:block">
                Diagnostic
              </Link>
              <Link href="/connexion" className="btn-primary min-h-10 px-4">
                <ButtonLabel>Connexion</ButtonLabel>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
