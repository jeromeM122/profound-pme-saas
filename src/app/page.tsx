import Link from 'next/link'
import { Wave } from '@/components/brand/Wave'

const TEXTURES = ['1A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C']

const PILLARS = [
  { n: '01', title: 'Ton diagnostic', text: 'Texture, porosité, cuir chevelu : ton profil capillaire en 60 secondes.', bg: 'bg-citron' },
  { n: '02', title: 'Tes jumelles capillaires', text: 'Suis les routines de celles et ceux qui ont exactement ton profil.', bg: 'bg-lavande' },
  { n: '03', title: 'Vu sur ta texture', text: 'Chaque produit montré en vidéo, sur des cheveux comme les tiens.', bg: 'bg-menthe' },
] as const

export default function Home() {
  return (
    <>
      {/* HERO — colorblock */}
      <section className="border-b-2 border-noir">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr] md:items-center md:py-20">
          <div className="grid gap-6">
            <p className="kicker">Hair-social commerce</p>
            <h1 className="title-xl">
              Ma texture,
              <br />
              <span className="bg-citron px-1 box-decoration-clone">ma couronne.</span>
            </h1>
            <p className="max-w-lg text-lg font-light sm:text-xl">
              Un lieu pensé pour les textures, les boucles, les histoires qu’on porte sur la tête.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/connexion" className="btn-primary">
                Créer mon profil capillaire
              </Link>
            </div>
          </div>

          {/* Composition inspired by the « univers coloré » page of the charte */}
          <div aria-hidden className="grid aspect-square w-full max-w-60 grid-cols-2 sm:max-w-md grid-rows-[1fr_1fr_auto] gap-3 justify-self-center md:justify-self-end">
            <div className="bg-bleu" />
            <div className="grid place-items-center bg-citron p-[18%]">
              <div className="size-full bg-bleu" />
            </div>
            <div className="grid place-items-center bg-bleu p-[18%]">
              <div className="size-full bg-citron" />
            </div>
            <div className="bg-citron" />
            <div className="col-span-2 h-4 bg-noir" />
          </div>
        </div>
      </section>

      {/* TEXTURES */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6">
        <div className="flex items-center gap-4">
          <h2 className="kicker font-bold">Toutes les textures</h2>
          <Wave name="tight" width={120} />
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Textures représentées">
          {TEXTURES.map((t) => (
            <li key={t} className="border-2 border-noir px-4 py-2 font-mono text-lg font-bold">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* MANIFESTE */}
      <section className="bg-bleu text-blanc">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6">
          <Wave name="wave" width={200} className="text-citron" />
          <p className="text-3xl leading-tight font-bold uppercase italic sm:text-5xl">Chaque tresse est une archive vivante.</p>
          <p className="max-w-xl text-lg">Tresser, c’est réunir : des rituels, des histoires, des héritages.</p>
        </div>
      </section>

      {/* PILIERS */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3">
        {PILLARS.map((p) => (
          <article key={p.n} className={`${p.bg} grid content-start gap-3 border-2 border-noir p-6`}>
            <span className="font-mono text-sm font-bold">{p.n}</span>
            <h3 className="text-xl font-bold uppercase">{p.title}</h3>
            <p>{p.text}</p>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section className="border-t-2 border-noir bg-citron">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
          <p className="text-3xl font-bold uppercase sm:text-4xl">Identité tressée, fierté assumée.</p>
          <Link href="/connexion" className="btn-primary">
            Rejoindre la communauté
          </Link>
        </div>
      </section>
    </>
  )
}
