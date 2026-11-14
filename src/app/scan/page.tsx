import type { Metadata } from 'next'
import { HairScanner } from '@/components/scan/HairScanner'
import { scanAvailable } from '@/server/scan/analyze'

export const metadata: Metadata = {
  title: 'Scan capillaire',
  description: 'Une photo de tes cheveux suffit pour estimer ta texture (1A à 4C) et créer ta routine.',
}

export default function ScanPage() {
  return (
    <section className="mx-auto grid max-w-lg gap-8 px-4 pt-8 pb-10">
      <div className="grid gap-2 text-center">
        <p className="kicker text-or">Scan capillaire</p>
        <h1 className="display text-4xl">
          Une photo, <span className="accent">ta texture</span>
        </h1>
        <p className="text-taupe">L’IA estime ton type de boucle, puis 4 questions suffisent pour créer ta routine.</p>
      </div>
      <HairScanner available={scanAvailable()} />
    </section>
  )
}
