import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Vérifie tes e-mails', robots: { index: false } }

export default function VerificationPage() {
  return (
    <section className="mx-auto grid max-w-md gap-4 pt-16 text-center">
      <h1 className="font-display text-3xl font-bold">Regarde ta boîte mail ✉️</h1>
      <p className="text-muted">
        Si l’adresse est valide, tu viens de recevoir un lien de connexion. Il expire dans 15 minutes et ne fonctionne
        qu’une fois.
      </p>
    </section>
  )
}
