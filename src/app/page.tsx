import Link from 'next/link'
import { Wave } from '@/components/brand/Wave'
import type { WaveName } from '@/components/brand/wave-paths'
import { Marquee } from '@/components/motion/Marquee'
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

const TICKER = ['Ma texture, ma couronne', 'Nos cheveux parlent', 'Chaque tresse est une archive vivante', 'Nos racines ont du style']

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative grid min-h-[100svh] place-items-center overflow-hidden px-4 pt-24 pb-16">
        <div className="grid max-w-6xl justify-items-center gap-8 text-center">
          <p className="kicker text-gris">Hair-social commerce</p>
          <h1 className="display text-[13vw] sm:text-[9vw] xl:text-[8.5rem]">
            Ma texture,
            <br />
            ma <span className="accent">couronne</span>.
          </h1>
          <p className="max-w-xl text-lg font-light text-ivoire/80 sm:text-xl">
            Un lieu pensé pour les textures, les boucles, les histoires qu’on porte sur la tête.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/diagnostic" className="btn-primary">
              <ButtonLabel>Faire mon diagnostic</ButtonLabel>
            </Link>
          </div>
        </div>

        {/* Floating info card */}
        <aside className="absolute bottom-6 left-4 hidden w-56 rounded-2xl border border-ivoire/15 bg-nuit/80 p-4 backdrop-blur sm:left-8 md:block">
          <p className="kicker text-gris">Diagnostic</p>
          <p className="mt-3 text-sm font-bold uppercase">Ton profil en 60 secondes</p>
          <div className="mt-3 border-t border-ivoire/15 pt-3">
            <Wave name="curl" width={150} className="text-citron" />
          </div>
        </aside>
        <Wave name="swell" width={420} className="pointer-events-none absolute -right-24 top-1/3 hidden text-bleu lg:block" />
      </section>

      {/* TICKER */}
      <Marquee items={TICKER} className="bg-citron py-4 font-mono text-sm font-bold uppercase text-noir sm:text-base" />

      {/* STATEMENT */}
      <section className="px-4 py-28 sm:py-40">
        <Reveal className="mx-auto max-w-6xl text-center">
          <p className="kicker mb-8 text-gris">Le manifeste</p>
          <p className="display text-[9vw] sm:text-6xl lg:text-7xl">
            Tresser, c’est <span className="accent">réunir</span> : des rituels, des <span className="accent">histoires</span>,
            des <span className="accent">héritages</span>. Chaque tresse est une archive vivante.
          </p>
        </Reveal>
      </section>

      {/* TWO WORLDS — diagnostic / communauté */}
      <section className="mx-auto grid max-w-7xl gap-3 px-2 sm:grid-cols-2 sm:px-3">
        <Reveal className="grid min-h-80 content-between sm:min-h-[28rem] rounded-[2rem] bg-citron p-8 text-noir sm:p-12">
          <p className="kicker">01 — Diagnostic</p>
          <div className="grid gap-4">
            <h2 className="display text-6xl sm:text-7xl">
              <span className="font-light italic">Mon</span>
              <br />
              profil
            </h2>
            <p className="max-w-sm text-lg">Texture, porosité, cuir chevelu, objectifs : un catalogue et un feed taillés pour toi.</p>
          </div>
        </Reveal>
        <Reveal className="grid min-h-80 content-between sm:min-h-[28rem] rounded-[2rem] bg-bleu p-8 text-blanc sm:p-12">
          <p className="kicker">02 — Communauté</p>
          <div className="grid gap-4">
            <h2 className="display text-6xl sm:text-7xl">
              <span className="font-light italic">Mes</span>
              <br />
              jumelles
            </h2>
            <p className="max-w-sm text-lg">Suis celles et ceux qui ont exactement ton profil, leurs routines et leur salle de bain.</p>
          </div>
        </Reveal>
      </section>

      {/* TEXTURES HALL */}
      <section className="mt-28 bg-nuit px-4 py-24 curve-top sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 grid gap-6 sm:grid-cols-2 sm:items-end">
            <h2 className="display text-5xl sm:text-7xl">
              Toutes
              <br />
              <span className="accent">les textures</span>
            </h2>
            <p className="max-w-md text-ivoire/70 sm:justify-self-end">
              Du raide au crépu, chaque profil a sa place. Trouve le tien et vois les produits appliqués sur des cheveux comme les tiens.
            </p>
          </Reveal>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {TEXTURES.map((t) => (
              <li key={t.code}>
                <div className="group relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-citron/70 transition-colors duration-500 ease-brand hover:bg-citron hover:text-noir">
                  <span className="display text-6xl sm:text-7xl">{t.code}</span>
                  <Wave name={t.wave} width={110} className="absolute top-6 text-citron transition-colors group-hover:text-noir" />
                  {/* notched label tab */}
                  <span className="absolute right-0 bottom-0 rounded-tl-2xl border-t border-l border-citron/70 bg-nuit px-3 py-1.5 text-xs font-bold group-hover:border-noir group-hover:bg-citron">
                    {t.label}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-14 grid justify-items-center gap-6 text-center">
            <p className="text-2xl font-light">Ton profil n’est pas dans une case ? Le diagnostic affine tout.</p>
            <Link href="/diagnostic" className="btn-primary">
              <ButtonLabel>Faire mon diagnostic</ButtonLabel>
            </Link>
          </div>
        </div>
      </section>

      {/* VIDEO PROMISE */}
      <section className="bg-nuit px-4 pt-8 pb-28">
        <Reveal className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1fr_auto]">
          <div className="grid gap-6">
            <p className="kicker text-gris">03 — Vu sur ta texture</p>
            <h2 className="display text-5xl sm:text-6xl">
              Nos cheveux <span className="accent">parlent</span>.
            </h2>
            <p className="max-w-md text-lg text-ivoire/70">
              Chaque produit montré en vidéo par la communauté — TikTok, Reels, Shorts — filtré sur ta texture.
            </p>
          </div>
          <div aria-hidden className="mx-auto grid aspect-[9/16] w-56 place-items-center rounded-[2.25rem] border-4 border-carbone bg-noir">
            <span className="grid size-16 place-items-center rounded-full bg-citron">
              <span className="ml-1 size-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-noir" />
            </span>
          </div>
        </Reveal>
      </section>
    </>
  )
}
