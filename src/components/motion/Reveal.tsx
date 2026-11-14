'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Fades/slides content in when it scrolls into view.
 * Server HTML is always visible (SEO, no-JS, LCP); only elements that start below the fold are hidden on mount.
 */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle')

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return
    setState('hidden')
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState('shown')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} data-reveal={state} className={className}>
      {children}
    </div>
  )
}
