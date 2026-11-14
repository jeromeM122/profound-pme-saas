import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="grid gap-4 pt-16 text-center">
      <h1 className="font-display text-3xl font-bold">Page introuvable</h1>
      <p className="text-muted">Cette page n’existe pas ou n’est pas accessible.</p>
      <Link href="/" className="btn-outline mx-auto">
        Retour à l’accueil
      </Link>
    </section>
  )
}
