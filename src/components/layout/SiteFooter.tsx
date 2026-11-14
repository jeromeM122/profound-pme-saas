import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Wave } from '@/components/brand/Wave'

export function SiteFooter() {
  return (
    <footer className="bg-gradient-to-b from-noir via-noir to-citron px-2 pt-24 pb-2 sm:px-3">
      <div className="relative rounded-[2rem] bg-carbone px-6 pt-20 pb-6 sm:px-12">
        {/* Tab holding the wordmark */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-t-3xl bg-carbone px-8 pt-4 pb-2">
          <Logo tone="blanc" height={22} />
        </div>

        <p className="display mx-auto max-w-4xl text-center text-4xl sm:text-7xl">
          Identité <span className="accent">tressée</span>,<br />
          fierté <span className="accent">assumée</span>.
        </p>

        <div className="mx-auto mt-16 grid max-w-4xl gap-10 text-center sm:grid-cols-3">
          <div className="grid content-start gap-2">
            <p className="kicker text-gris">Pages</p>
            <Link href="/" className="text-xl font-bold uppercase hover:text-citron">Accueil</Link>
            <Link href="/diagnostic" className="text-xl font-bold uppercase hover:text-citron">Diagnostic</Link>
            <Link href="/jumelles" className="text-xl font-bold uppercase hover:text-citron">Jumelles</Link>
          </div>
          <div className="grid place-items-center gap-4">
            <Wave name="curl" width={180} className="text-citron" />
            <p className="font-mono text-lg">Nos racines ont du style.</p>
          </div>
          <div className="grid content-start gap-2">
            <p className="kicker text-gris">Compte</p>
            <Link href="/compte" className="text-xl font-bold uppercase hover:text-citron">Mon compte</Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-2 border-t border-ivoire/10 pt-6 sm:flex-row">
          <p className="kicker text-gris">© {new Date().getFullYear()} tresser.fr</p>
          <p className="kicker text-gris">Ma texture, ma couronne</p>
        </div>
      </div>
    </footer>
  )
}
