import Link from 'next/link'

const STEPS = [
  { label: 'Mon diagnostic', href: '/diagnostic' },
  { label: 'Ma routine', href: '/ma-routine' },
  { label: 'Mes produits', href: '/ma-routine#a-acheter' },
  { label: 'Mon rituel', href: '/ma-routine#rituel' },
  { label: 'Mon suivi', href: '/ma-routine/suivi' },
] as const

/** The member journey, always visible on the key pages: diagnostic → routine → products → ritual. */
export function JourneySteps({ current, done }: { current: number; done: number }) {
  return (
    <nav aria-label="Mon parcours" className="border-b border-ligne bg-perle">
      <ol className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-4 sm:px-8">
        {STEPS.map((s, i) => {
          const state = i < done ? 'done' : i === current ? 'current' : 'todo'
          return (
            <li key={s.label} className="flex shrink-0 items-center gap-3">
              <span
                aria-hidden
                className={`grid size-6 place-items-center rounded-full border font-mono text-[0.62rem] ${
                  state === 'done' ? 'border-or bg-or text-creme' : state === 'current' ? 'border-encre bg-encre text-creme' : 'border-ligne text-taupe'
                }`}
              >
                {state === 'done' ? '✓' : i + 1}
              </span>
              <Link
                href={s.href as '/ma-routine'}
                aria-current={state === 'current' ? 'step' : undefined}
                className={`kicker text-[0.6rem] ${state === 'todo' ? 'text-taupe' : 'text-encre'} hover:text-or`}
              >
                {s.label}
              </Link>
              {i < STEPS.length - 1 && <span aria-hidden className="ml-3 hidden h-px w-10 bg-ligne sm:block" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
