import { getImageProps } from 'next/image'
import type { RoutineImage } from '@/content/routines'

/** Art-directed hero: portrait crop on mobile, landscape on desktop (only one is downloaded). */
export function HeroPicture({ desktop, mobile, alt, className = '' }: { desktop: RoutineImage; mobile: RoutineImage; alt: string; className?: string }) {
  const common = { alt, priority: true, sizes: '100vw' }
  const { props: d } = getImageProps({ ...common, src: desktop.src, width: desktop.w, height: desktop.h })
  const { props: m } = getImageProps({ ...common, src: mobile.src, width: mobile.w, height: mobile.h })
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={d.srcSet} sizes="100vw" />
      <img {...m} alt={alt} className={className} />
    </picture>
  )
}
