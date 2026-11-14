import localFont from 'next/font/local'

/**
 * Charte graphique: Apercu (Light, Regular, Medium, Bold, Bold italic) + Apercu Mono / Mono Bold.
 * Apercu is a commercial typeface (Colophon Foundry) and requires a web licence.
 *
 * Until the licensed .woff2 files are added, we self-host the closest open-source substitutes:
 *   DM Sans (variable, 300–700 + italics) for Apercu, DM Mono for Apercu Mono.
 * To switch: put the Apercu files in src/app/fonts/ and replace the `src` arrays below
 * (keep the `variable` names — the rest of the CSS does not change).
 */
export const fontSans = localFont({
  variable: '--font-brand-sans',
  display: 'swap',
  src: [
    { path: '../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2', weight: '300 700', style: 'normal' },
    { path: '../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-italic.woff2', weight: '300 700', style: 'italic' },
  ],
  fallback: ['ui-sans-serif', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
})

export const fontMono = localFont({
  variable: '--font-brand-mono',
  display: 'swap',
  src: [
    { path: '../../node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff2', weight: '700', style: 'normal' },
  ],
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
})
