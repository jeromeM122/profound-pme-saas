import { Logo } from '@/components/brand/Logo'
import { Wave } from '@/components/brand/Wave'

export function SiteFooter() {
  return (
    <footer className="bg-noir text-blanc">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6">
        <Logo tone="blanc" height={32} />
        <Wave name="curl" width={220} className="text-citron" />
        <p className="font-mono text-xl font-bold sm:text-2xl">Nos racines ont du style.</p>
        <p className="kicker text-blanc/70">© {new Date().getFullYear()} tresser.fr</p>
      </div>
    </footer>
  )
}
