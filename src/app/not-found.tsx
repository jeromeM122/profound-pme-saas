import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="mx-auto grid max-w-md gap-4 px-4 py-16 text-center">
      <h1 className="text-3xl font-bold uppercase">Page introuvable</h1>
      <p className="text-gris">Cette page n’existe pas ou n’est pas accessible.</p>
      <Link href="/" className="btn-outline mx-auto">
        Retour à l’accueil
      </Link>
    </section>
  )
}
