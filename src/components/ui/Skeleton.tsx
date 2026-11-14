/** Lightweight loading placeholders (perceived performance on dynamic pages). */
export function SkeletonGrid({ cards = 8, square = false }: { cards?: number; square?: boolean }) {
  return (
    <div role="status" aria-label="Chargement" className="mx-auto max-w-7xl animate-pulse px-4 pt-16 pb-24 sm:px-8">
      <div className="mx-auto mb-12 grid max-w-xl justify-items-center gap-4">
        <div className="h-3 w-40 bg-sable" />
        <div className="h-12 w-full bg-sable" />
        <div className="h-4 w-3/4 bg-sable" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="grid gap-3">
            <div className={`${square ? 'aspect-square' : 'aspect-[3/4]'} bg-sable`} />
            <div className="h-3 w-1/3 bg-sable" />
            <div className="h-4 w-4/5 bg-sable" />
          </div>
        ))}
      </div>
      <span className="sr-only">Chargement…</span>
    </div>
  )
}
