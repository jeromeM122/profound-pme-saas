/** Initials avatar (no third-party images are loaded: CSP img-src 'self'). */
export function Avatar({ name, handle, size = 'md' }: { name: string | null; handle: string | null; size?: 'md' | 'xl' }) {
  const src = (name || handle || '?').trim()
  const initials = src.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?'
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-encre font-normal text-creme ${size === 'xl' ? 'size-28 text-4xl' : 'size-12 text-lg'}`}>
      {initials}
    </span>
  )
}
