import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { SiteHeader } from '@/components/layout/SiteHeader'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  title: { default: 'Tresser — la communauté des cheveux texturés', template: '%s · Tresser' },
  description:
    'Diagnostic capillaire, routines et produits recommandés par des profils capillaires comme le tien. Achète sur Tresser ou chez nos partenaires.',
  openGraph: { type: 'website', locale: 'fr_FR', siteName: 'Tresser' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#faf6f1' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading request headers opts every page into dynamic rendering, which the per-request CSP nonce requires.
  await headers()
  return (
    <html lang="fr">
      <body className="min-h-dvh">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu" className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  )
}
