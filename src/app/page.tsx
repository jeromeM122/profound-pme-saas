import Image from 'next/image'
import Link from 'next/link'
import { Wave } from '@/components/brand/Wave'
import type { WaveName } from '@/components/brand/wave-paths'
import { Reveal } from '@/components/motion/Reveal'
import { ButtonLabel } from '@/components/ui/ButtonLabel'
import cindyImg from '@/assets/photos/cindy.webp'
import gabouImg from '@/assets/photos/gabou.webp'
import joannaImg from '@/assets/photos/joanna.webp'
import laurenBannerImg from '@/assets/photos/lauren-banniere.webp'
import laurenRoutineImg from '@/assets/photos/lauren-routine.webp'
import lindsayImg from '@/assets/photos/lindsay.webp'
import tresserImg from '@/assets/photos/tresser.webp'

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

/** Community routines published on tresser.fr (photos reused from the brand's own articles). */
const ROUTINES = [
  { name: 'Cindy', title: 'Ses essentiels pour cheveux crépus', img: cindyImg, alt: 'Cindy, cheveux crépus relevés en chignon, lunettes de soleil', href: '/routines/cindy' },
  { name: 'Joanna', title: 'Une routine multitexture', img: joannaImg, alt: 'Joanna, cheveux bouclés volumineux, assise en terrasse', href: '/routines/routine-capillaire-multitexture-joanna' },
  { name: 'Lindsay', title: 'Routine minimaliste pour locks', img: lindsayImg, alt: 'Locks de Lindsay vues de dos', href: '/routines/soin-locks-lindsay' },
  { name: 'Gabou', title: 'Cheveux frisés et bouclés', img: gabouImg, alt: 'Gabou, cheveux frisés courts, lunettes teintées', href: '/routines/cheveux-boucles-frises-gabou' },
] as const

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
              <ButtonLabel>Créer ma routine</ButtonLabel>
            </Link>
            <Link href="/jumelles" className="kicker border-b border-encre/40 pb-1 transition-colors hover:border-or hover:text-or">
              La communauté
            </Link>
          </div>
        </div>

        {/* Framed editorial portrait with an offset gold hairline */}
        <figure className="relative mx-auto w-full max-w-md pr-4 pb-4">
          <div aria-hidden className="absolute inset-0 top-4 left-4 border border-or-clair" />
          <Image
            src={tresserImg}
            alt="Trois portraits de femmes aux cheveux crépus naturels, en lumière chaude"
            priority
            placeholder="blur"
            sizes="(min-width: 768px) 28rem, 90vw"
            className="relative aspect-[4/5] w-full object-cover"
          />
          <figcaption className="kicker absolute -bottom-6 left-4 text-[0.6rem] text-taupe">De 1A à 4C · toutes les textures</figcaption>
        </figure>
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

      {/* EDITORIAL BANNER */}
      <section className="relative bg-perle">
        <Image
          src={laurenBannerImg}
          alt="Lauren passe la main dans ses cheveux crépus, de profil, sur fond clair"
          placeholder="blur"
          sizes="100vw"
          className="h-[60vh] max-h-[640px] min-h-[360px] w-full object-cover object-[30%_center]"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-8 md:absolute md:inset-0 md:flex md:items-center md:justify-end">
          <Reveal className="grid gap-6 bg-perle/90 py-10 md:max-w-sm md:p-10 md:backdrop-blur-sm">
            <p className="kicker text-or">La routine de Lauren</p>
            <p className="display text-3xl sm:text-4xl">
              Prendre soin, <span className="accent">en conscience</span>
            </p>
            <p className="leading-relaxed text-taupe">Des gestes simples, choisis pour sa texture : c’est ce que le diagnostic t’aide à construire.</p>
            <Link href="/diagnostic" className="btn-ghost w-fit">
              <ButtonLabel>Créer ma routine</ButtonLabel>
            </Link>
          </Reveal>
        </div>
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

      {/* COMMUNITY ROUTINES */}
      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-8">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="grid gap-4">
            <p className="kicker text-or">Elles et ils racontent</p>
            <h2 className="display text-4xl sm:text-5xl">
              Les routines <span className="accent">de la communauté</span>
            </h2>
          </div>
          <Link href="/routines" className="kicker border-b border-encre/40 pb-1 transition-colors hover:border-or hover:text-or">
            Toutes les routines
          </Link>
        </Reveal>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {ROUTINES.map((r) => (
            <li key={r.name}>
              <Link href={r.href as '/routines'} className="group grid gap-4">
                <div className="overflow-hidden bg-sable">
                  <Image
                    src={r.img}
                    alt={r.alt}
                    placeholder="blur"
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-[1.4s] ease-brand group-hover:scale-[1.04]"
                  />
                </div>
                <div className="grid gap-1">
                  <p className="kicker text-[0.62rem] text-or">{r.name}</p>
                  <p className="text-lg leading-snug">{r.title}</p>
                  <p className="kicker mt-1 text-[0.6rem] text-taupe transition-colors group-hover:text-encre">Voir sa routine →</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
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
          <div aria-hidden className="relative grid aspect-[9/16] w-56 place-items-center overflow-hidden rounded-[2rem] border-[6px] border-perle bg-sable shadow-[0_30px_60px_-30px_rgb(28_24_20/0.45)]">
            <Image src={laurenRoutineImg} alt="" placeholder="blur" sizes="14rem" className="absolute inset-0 h-full w-full object-cover object-[35%_center]" />
            <span className="relative grid size-16 place-items-center rounded-full border border-or-clair bg-creme/90 backdrop-blur">
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
