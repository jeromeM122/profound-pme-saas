import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { fontMono, fontSans } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  title: { default: 'tresser.fr — ma texture, ma couronne', template: '%s · tresser.fr' },
  description:
    'Un lieu pensé pour les textures, les boucles, les histoires qu’on porte sur la tête. Diagnostic capillaire, communauté, routines et produits testés par des cheveux comme les tiens.',
  openGraph: { type: 'website', locale: 'fr_FR', siteName: 'tresser.fr' },
  icons: { icon: '/brand/favicon.svg' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#000000' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading request headers opts every page into dynamic rendering, which the per-request CSP nonce requires.
  await headers()
  return (
    <html lang="fr" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-citron focus:px-4 focus:py-2 focus:font-bold focus:text-noir"
        >
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu" className="w-full flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
