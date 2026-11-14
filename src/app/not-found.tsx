import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="mx-auto grid max-w-md gap-4 px-4 pt-16 pb-16 text-center">
      <h1 className="display text-4xl sm:text-5xl">Page introuvable</h1>
      <p className="text-taupe">Cette page n’existe pas ou n’est pas accessible.</p>
      <Link href="/" className="btn-ghost mx-auto">
        Retour à l’accueil
      </Link>
    </section>
  )
}
