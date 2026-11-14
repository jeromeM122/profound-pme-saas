import Link from 'next/link'

const TEXTURES = ['2C', '3A', '3B', '3C', '4A', '4B', '4C']

export default function Home() {
  return (
    <section className="grid gap-8 pt-10 sm:pt-16">
      <div className="grid gap-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-clay">Hair-Social Commerce</p>
        <h1 className="font-display text-4xl leading-tight font-bold sm:text-6xl">
          Les soins qui marchent <span className="text-clay">sur des cheveux comme les tiens</span>.
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Fais ton diagnostic en 60 secondes, retrouve tes jumelles capillaires et vois chaque produit appliqué en vidéo sur ta texture.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/connexion" className="btn-primary">
            Créer mon profil capillaire
          </Link>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Textures représentées">
        {TEXTURES.map((t) => (
          <li key={t} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
            {t}
          </li>
        ))}
      </ul>
    </section>
  )
}
