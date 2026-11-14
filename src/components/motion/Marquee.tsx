/** Infinite ticker (pure CSS). The duplicated track is hidden from assistive tech. */
export function Marquee({ items, className = '' }: { items: readonly string[]; className?: string }) {
  const track = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((t, i) => (
        <li key={i} className="flex items-center gap-8 whitespace-nowrap">
          <span>{t}</span>
          <span aria-hidden className="inline-block size-2.5 rotate-45 bg-current" />
        </li>
      ))}
    </ul>
  )
  return (
    <div className={`flex overflow-hidden ${className}`}>
      <div className="flex animate-marquee motion-reduce:animate-none">
        {track(false)}
        {track(true)}
      </div>
    </div>
  )
}
