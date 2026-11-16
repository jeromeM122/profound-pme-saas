import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

const col = 'grid content-start gap-3.5'
const head = 'text-[0.68rem] uppercase tracking-[0.16em] text-encre'
const link = 'text-sm text-taupe transition-colors hover:text-encre'

export function SiteFooter() {
  return (
    <footer className="border-t border-ligne bg-white text-encre">
      <div className="px-4 pt-16 pb-10 sm:px-10">
        <div className="grid gap-12 sm:grid-cols-4">
          <div className={col}>
            <p className={head}>Le parcours</p>
            <Link href="/scan" className={link}>Scan capillaire</Link>
            <Link href="/diagnostic" className={link}>Diagnostic</Link>
            <Link href="/ma-routine" className={link}>Ma routine</Link>
            <Link href="/ma-routine/suivi" className={link}>Mon suivi</Link>
          </div>
          <div className={col}>
            <p className={head}>Explorer</p>
            <Link href="/routines" className={link}>Routines capillaires</Link>
            <Link href="/produits" className={link}>Produits</Link>
            <Link href="/jumelles" className={link}>Jumelles capillaires</Link>
          </div>
          <div className={col}>
            <p className={head}>Mon espace</p>
            <Link href="/compte" className={link}>Mon compte</Link>
            <Link href="/connexion" className={link}>Connexion</Link>
          </div>
          <div className={col}>
            <p className={head}>La maison</p>
            <p className="text-sm text-taupe">Un lieu pensé pour les textures, les boucles et les histoires qu’on porte sur la tête.</p>
          </div>
        </div>
        <div className="mt-20 grid justify-items-center gap-6 border-t border-ligne pt-12">
          <Logo height={28} />
          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-taupe">© {new Date().getFullYear()} tresser.fr · Nos racines ont du style</p>
        </div>
      </div>
    </footer>
  )
}
