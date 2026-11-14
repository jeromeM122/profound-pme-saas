import type { Metadata } from 'next'
import { Wave } from '@/components/brand/Wave'

export const metadata: Metadata = { title: 'Vérifie tes e-mails', robots: { index: false } }

export default function VerificationPage() {
  return (
    <section className="mx-auto grid max-w-md gap-4 px-4 pt-16 pb-16 text-center">
      <h1 className="display text-4xl sm:text-5xl">Regarde ta boîte mail</h1>
      <Wave name="swell" width={180} className="justify-self-center text-or" />
      <p className="text-taupe">
        Si l’adresse est valide, tu viens de recevoir un lien de connexion. Il expire dans 15 minutes et ne fonctionne
        qu’une fois.
      </p>
    </section>
  )
}
