'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, RitualIcon, RoutinesIcon, ScanIcon, UserIcon } from './Icons'

/** App-style bottom navigation (mobile). The scan is the central, raised action. */
export function BottomTabBar({ signedIn }: { signedIn: boolean }) {
  const path = usePathname()
  const tabs = [
    { href: '/', label: 'Accueil', Icon: HomeIcon, match: (p: string) => p === '/' },
    { href: '/routines', label: 'Explorer', Icon: RoutinesIcon, match: (p: string) => p.startsWith('/routines') || p.startsWith('/produits') },
    { href: '/scan', label: 'Scan', Icon: ScanIcon, match: (p: string) => p.startsWith('/scan') || p.startsWith('/diagnostic'), primary: true },
    { href: '/ma-routine', label: 'Ma routine', Icon: RitualIcon, match: (p: string) => p.startsWith('/ma-routine') },
    { href: signedIn ? '/compte' : '/connexion', label: signedIn ? 'Profil' : 'Connexion', Icon: UserIcon, match: (p: string) => p.startsWith('/compte') || p.startsWith('/connexion') || p.startsWith('/@') || p.startsWith('/membre') },
  ] as const
  return (
    <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-40 border-t border-ligne bg-creme/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end">
        {tabs.map(({ href, label, Icon, match, ...rest }) => {
          const active = match(path)
          const primary = 'primary' in rest
          return (
            <li key={label} className="grid">
              <Link
                href={href as '/'}
                aria-current={active ? 'page' : undefined}
                className={`grid justify-items-center gap-1 pt-2 pb-2 text-[0.6rem] tracking-wide ${active ? 'text-encre' : 'text-taupe'}`}
              >
                {primary ? (
                  <span className={`-mt-6 grid size-14 place-items-center rounded-full shadow-[0_10px_25px_-10px_rgb(28_24_20/0.6)] ring-4 ring-creme ${active ? 'bg-or text-creme' : 'bg-encre text-creme'}`}>
                    <Icon />
                  </span>
                ) : (
                  <span className={`relative grid place-items-center ${active ? 'text-or' : ''}`}>
                    <Icon />
                  </span>
                )}
                <span className={active ? 'font-normal' : ''}>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
