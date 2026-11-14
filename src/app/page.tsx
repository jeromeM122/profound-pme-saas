import Link from 'next/link'
import { Wave } from '@/components/brand/Wave'
import type { WaveName } from '@/components/brand/wave-paths'
import { Reveal } from '@/components/motion/Reveal'
import { ButtonLabel } from '@/components/ui/ButtonLabel'

const TEXTURES: { code: string; label: string; wave: WaveName }[] = [
  { code: '1A', label: 'Raides fins', wave: 'swell' },
  { code: '1B', label: 'Raides avec corps', wave: 'swell' },
  { code: '1C', label: 'Raides épais', wave: 'swell' },
  { code: '2A', label: 'Ondulés légers', wave: 'wave' },
  { code: '2B', label: 'Ondulés', wave: 'wave' },
  { code: '2C', label: 'Ondulés épais', wave: 'wave' },
  { code: '3A', label: 'Boucles larges', wave: 'tight' },
  { code: '3B', label: 'Boucles ressort', wave: 'tight' },
  { code: '3C', label: 'Boucles serrées', wave: 'tight' },
  { code: '4A', label: 'Frisés serrés', wave: 'curl' },
  { code: '4B', label: 'Crépus en Z', wave: 'curl' },
  { code: '4C', label: 'Crépus très serrés', wave: 'curl' },
]

const RITUAL = [
  { n: 'I', title: 'Le diagnostic', text: 'Texture, porosité, cuir chevelu, objectifs : six questions pour révéler ton profil capillaire.' },
  { n: 'II', title: 'Les jumelles', text: 'Suis les routines de celles et ceux qui partagent exactement ton profil.' },
  { n: 'III', title: 'Le rituel', text: 'Des soins choisis pour ta texture, et vus en vidéo sur des cheveux comme les tiens.' },
] as const

export default function Home() {
  return (
    <>
      {/* HERO — editorial split */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-16 pb-24 sm:px-8 md:grid-cols-[1.1fr_1fr] md:pt-24">
        <div className="grid gap-8">
          <p className="kicker text-or">Diagnostic capillaire</p>
          <h1 className="display text-5xl sm:text-7xl lg:text-[5.5rem]">
            Ma texture,
            <br />
            <span className="accent">ma couronne.</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-taupe">
            Un lieu pensé pour les textures, les boucles, les histoires qu’on porte sur la tête.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/diagnostic" className="btn-primary">
              <ButtonLabel>Découvrir mon profil</ButtonLabel>
            </Link>
            <Link href="/jumelles" className="kicker border-b border-encre/40 pb-1 transition-colors hover:border-or hover:text-or">
              La communauté
            </Link>
          </div>
        </div>

        {/* Champagne halo — product-spotlight composition (no photography yet) */}
        <div aria-hidden className="relative mx-auto aspect-[4/5] w-full max-w-md">
          <div className="absolute inset-0 bg-sable" />
          <div className="absolute top-[12%] left-1/2 aspect-square w-[72%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fbf8f3_0%,#efe2c8_45%,#d9bf8c_100%)] opacity-90" />
          <div className="absolute top-[12%] left-1/2 aspect-square w-[72%] -translate-x-1/2 rounded-full border border-or-clair/70" />
          <div className="absolute top-[17%] left-1/2 aspect-square w-[62%] -translate-x-1/2 rounded-full border border-or-clair/40" />
          <div className="absolute inset-x-0 bottom-[9%] grid justify-items-center gap-3">
            <Wave name="curl" width={180} className="text-or" />
            <p className="kicker text-[0.6rem] text-taupe">De 1A à 4C</p>
          </div>
        </div>
      </section>

      {/* MANIFESTE */}
      <section className="bg-perle px-4 py-28 sm:py-36">
        <Reveal className="mx-auto grid max-w-4xl justify-items-center gap-10 text-center">
          <Wave name="wave" width={140} className="text-or" />
          <p className="text-3xl leading-snug font-light sm:text-5xl sm:leading-tight">
            Tresser, c’est <span className="accent">réunir</span> : des rituels, des histoires, des héritages.
          </p>
          <p className="kicker text-taupe">Chaque tresse est une archive vivante</p>
        </Reveal>
      </section>

      {/* LE RITUEL — three steps */}
      <section className="mx-auto max-w-7xl px-4 py-28 sm:px-8">
        <Reveal className="mb-16 grid justify-items-center gap-4 text-center">
          <p className="kicker text-or">Le rituel tresser</p>
          <h2 className="display text-4xl sm:text-5xl">Trois gestes</h2>
        </Reveal>
        <ol className="grid border-y border-ligne md:grid-cols-3 md:divide-x md:divide-ligne">
          {RITUAL.map((s) => (
            <li key={s.n}>
              <Reveal className="grid gap-5 px-6 py-12 text-center md:px-10">
                <span className="font-light italic text-or text-3xl">{s.n}</span>
                <h3 className="kicker text-sm text-encre">{s.title}</h3>
                <p className="leading-relaxed text-taupe">{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex justify-center">
          <Link href="/diagnostic" className="btn-ghost">
            <ButtonLabel>Commencer le diagnostic</ButtonLabel>
          </Link>
        </div>
      </section>

      {/* TEXTURES */}
      <section className="bg-sable px-4 py-28 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 grid gap-6 md:grid-cols-2 md:items-end">
            <div className="grid gap-4">
              <p className="kicker text-or">Toutes les textures</p>
              <h2 className="display text-4xl sm:text-5xl">
                Du raide <span className="accent">au crépu</span>
              </h2>
            </div>
            <p className="max-w-md leading-relaxed text-taupe md:justify-self-end">
              Chaque profil a sa place. Trouve le tien et découvre les soins appliqués sur des cheveux comme les tiens.
            </p>
          </Reveal>
          <ul className="grid grid-cols-2 gap-px bg-ligne sm:grid-cols-3 lg:grid-cols-4">
            {TEXTURES.map((t) => (
              <li key={t.code} className="group grid aspect-square content-between bg-perle p-6 lg:aspect-[5/4] transition-colors duration-700 ease-brand hover:bg-creme">
                <Wave name={t.wave} width={90} className="text-or-clair transition-colors duration-700 group-hover:text-or" />
                <div className="grid gap-2">
                  <span className="text-5xl font-extralight sm:text-6xl">{t.code}</span>
                  <span className="kicker text-[0.62rem] text-taupe">{t.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* VIDEO PROMISE */}
      <section className="mx-auto grid max-w-6xl items-center gap-16 px-4 py-28 sm:px-8 md:grid-cols-[1fr_auto]">
        <Reveal className="grid gap-6">
          <p className="kicker text-or">Vu sur ta texture</p>
          <h2 className="display text-4xl sm:text-5xl">
            Nos cheveux <span className="accent">parlent</span>
          </h2>
          <p className="max-w-md leading-relaxed text-taupe">
            Chaque soin montré en vidéo par la communauté — TikTok, Reels, Shorts — sur des cheveux comme les tiens.
          </p>
        </Reveal>
        <Reveal className="mx-auto">
          <div aria-hidden className="grid aspect-[9/16] w-52 place-items-center rounded-[2rem] border border-ligne bg-perle shadow-[0_30px_60px_-30px_rgb(28_24_20/0.35)]">
            <span className="grid size-16 place-items-center rounded-full border border-or-clair bg-creme">
              <span className="ml-1 size-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-or" />
            </span>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="border-t border-ligne px-4 py-24 text-center">
        <Reveal className="mx-auto grid max-w-2xl justify-items-center gap-8">
          <p className="display text-3xl sm:text-4xl">
            Ton profil, <span className="accent">révélé</span> en soixante secondes
          </p>
          <Link href="/diagnostic" className="btn-primary">
            <ButtonLabel>Faire mon diagnostic</ButtonLabel>
          </Link>
        </Reveal>
      </section>
    </>
  )
}
