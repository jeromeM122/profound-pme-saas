/** Minimal stroke icons for the app shell (inline SVG: no icon font, no external request). */
type P = { className?: string }
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const HomeIcon = ({ className = 'size-6' }: P) => (
  <svg viewBox="0 0 24 24" {...base} className={className} aria-hidden><path d="M3.5 10.5 12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19v-8.5Z" /></svg>
)
export const RoutinesIcon = ({ className = 'size-6' }: P) => (
  <svg viewBox="0 0 24 24" {...base} className={className} aria-hidden><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></svg>
)
export const ScanIcon = ({ className = 'size-7' }: P) => (
  <svg viewBox="0 0 24 24" {...base} className={className} aria-hidden><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><path d="M8.5 13.5c1-2.5 2-2.5 3.5 0s2.5 2.5 3.5 0M8.5 10c1-2.5 2-2.5 3.5 0s2.5 2.5 3.5 0" /></svg>
)
export const RitualIcon = ({ className = 'size-6' }: P) => (
  <svg viewBox="0 0 24 24" {...base} className={className} aria-hidden><path d="M12 3.5c-2.5 3-6 5.5-6 9.5a6 6 0 0 0 12 0c0-4-3.5-6.5-6-9.5Z" /><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" /></svg>
)
export const UserIcon = ({ className = 'size-6' }: P) => (
  <svg viewBox="0 0 24 24" {...base} className={className} aria-hidden><circle cx="12" cy="8.5" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
)
export const SearchIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" {...base} className={className} aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
)
