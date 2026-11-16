'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, RitualIcon, RoutinesIcon, ScanIcon, UserIcon } from './Icons'

/** Mobile bottom navigation: quiet, monochrome, a single hairline above. The active tab is underlined. */
export function BottomTabBar({ signedIn }: { signedIn: boolean }) {
  const path = usePathname()
  const tabs = [
    { href: '/', label: 'Accueil', Icon: HomeIcon, match: (p: string) => p === '/' },
    { href: '/routines', label: 'Explorer', Icon: RoutinesIcon, match: (p: string) => p.startsWith('/routines') || p.startsWith('/produits') },
    { href: '/scan', label: 'Scan', Icon: ScanIcon, match: (p: string) => p.startsWith('/scan') || p.startsWith('/diagnostic') },
    { href: '/ma-routine', label: 'Ma routine', Icon: RitualIcon, match: (p: string) => p.startsWith('/ma-routine') },
    { href: signedIn ? '/compte' : '/connexion', label: signedIn ? 'Profil' : 'Connexion', Icon: UserIcon, match: (p: string) => p.startsWith('/compte') || p.startsWith('/connexion') || p.startsWith('/@') || p.startsWith('/membre') },
  ] as const
  return (
    <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-40 border-t border-ligne bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map(({ href, label, Icon, match }) => {
          const active = match(path)
          return (
            <li key={label} className="grid">
              <Link
                href={href as '/'}
                aria-current={active ? 'page' : undefined}
                className={`grid justify-items-center gap-1.5 pt-3 pb-2.5 text-[0.56rem] uppercase tracking-[0.12em] ${active ? 'text-encre' : 'text-taupe'}`}
              >
                <Icon className="size-[1.35rem]" />
                <span className={`border-b pb-0.5 ${active ? 'border-encre' : 'border-transparent'}`}>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
