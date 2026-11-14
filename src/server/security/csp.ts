/**
 * Content-Security-Policy builder.
 * - Scripts: nonce + strict-dynamic only. No third-party SDK (TikTok/Meta JS) is ever allowed.
 * - Frames: only the three video players, loaded behind a click-to-play facade.
 */
export const VIDEO_FRAME_ORIGINS = [
  'https://www.tiktok.com',
  'https://www.instagram.com',
  'https://www.youtube-nocookie.com',
] as const

export function buildCsp(nonce: string, opts: { dev: boolean }): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(opts.dev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", `'nonce-${nonce}'`],
    'img-src': ["'self'", 'blob:', 'data:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(opts.dev ? ['ws:'] : [])],
    'media-src': ["'self'"],
    'frame-src': [...VIDEO_FRAME_ORIGINS],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", 'https://accounts.google.com', 'https://appleid.apple.com'],
    'frame-ancestors': ["'none'"],
    ...(opts.dev ? {} : { 'upgrade-insecure-requests': [] }),
  }
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
    .join('; ')
}
