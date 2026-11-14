import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Wave } from '@/components/brand/Wave'

const col = 'grid content-start gap-3'
const link = 'text-sm text-creme/80 transition-colors hover:text-or-clair'

export function SiteFooter() {
  return (
    <footer className="bg-encre text-creme">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-8">
        <div className="grid justify-items-center gap-6 text-center">
          <Logo tone="blanc" height={30} />
          <Wave name="curl" width={170} className="text-or-clair" />
          <p className="max-w-md text-lg font-light text-creme/85">
            Identité tressée, <em className="text-or-clair">fierté assumée</em>.
          </p>
        </div>

        <div className="mt-16 h-px bg-gradient-to-r from-transparent via-or-clair/60 to-transparent" />

        <div className="mt-12 grid gap-10 text-center sm:grid-cols-3 sm:text-left">
          <div className={col}>
            <p className="kicker text-or-clair">Découvrir</p>
            <Link href="/ma-routine" className={link}>Ma routine sur-mesure</Link>
            <Link href="/routines" className={link}>Routines capillaires</Link>
            <Link href="/produits" className={link}>Produits</Link>
            <Link href="/diagnostic" className={link}>Diagnostic capillaire</Link>
            <Link href="/jumelles" className={link}>Jumelles capillaires</Link>
          </div>
          <div className={col}>
            <p className="kicker text-or-clair">Mon espace</p>
            <Link href="/compte" className={link}>Mon compte</Link>
            <Link href="/connexion" className={link}>Connexion</Link>
          </div>
          <div className={col}>
            <p className="kicker text-or-clair">La maison</p>
            <p className="text-sm text-creme/80">Un lieu pensé pour les textures, les boucles et les histoires qu’on porte sur la tête.</p>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-creme/10 pt-6 sm:flex-row">
          <p className="kicker text-[0.6rem] text-creme/60">© {new Date().getFullYear()} tresser.fr</p>
          <p className="kicker text-[0.6rem] text-creme/60">Nos racines ont du style</p>
        </div>
      </div>
    </footer>
  )
}
