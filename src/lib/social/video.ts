/**
 * Strict parsing of TikTok / Instagram / YouTube video links. Only the platform id is kept;
 * embed and canonical URLs are rebuilt from it (never from user input). Short links that would
 * require following a redirect (vm.tiktok.com, instagr.am…) are refused on purpose (no SSRF).
 */
export type LinkSource = 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE'
export type ParsedVideo = { source: LinkSource; id: string; handle: string | null }

const TIKTOK_HOSTS = ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com']
const INSTAGRAM_HOSTS = ['instagram.com', 'www.instagram.com']
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com']

export function parseVideoUrl(raw: string): ParsedVideo | null {
  const input = raw.trim()
  if (!input || input.length > 300) return null
  let u: URL
  try {
    u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`)
  } catch {
    return null
  }
  if ((u.protocol !== 'https:' && u.protocol !== 'http:') || u.username || u.password || u.port) return null
  const host = u.hostname.toLowerCase()
  const path = u.pathname

  if (TIKTOK_HOSTS.includes(host)) {
    const m = /^\/@([a-zA-Z0-9_.]{2,24})\/video\/(\d{8,25})\/?$/.exec(path)
    return m ? { source: 'TIKTOK', id: m[2]!, handle: m[1]! } : null
  }
  if (INSTAGRAM_HOSTS.includes(host)) {
    const m = /^\/(?:reels?|p)\/([A-Za-z0-9_-]{5,40})\/?$/.exec(path)
    return m ? { source: 'INSTAGRAM', id: m[1]!, handle: null } : null
  }
  if (YOUTUBE_HOSTS.includes(host)) {
    const shorts = /^\/shorts\/([A-Za-z0-9_-]{11})\/?$/.exec(path)
    if (shorts) return { source: 'YOUTUBE', id: shorts[1]!, handle: null }
    if (path === '/watch') {
      const v = u.searchParams.get('v')
      return v && /^[A-Za-z0-9_-]{11}$/.test(v) ? { source: 'YOUTUBE', id: v, handle: null } : null
    }
    return null
  }
  if (host === 'youtu.be') {
    const m = /^\/([A-Za-z0-9_-]{11})\/?$/.exec(path)
    return m ? { source: 'YOUTUBE', id: m[1]!, handle: null } : null
  }
  return null
}

const ID_RE: Record<LinkSource, RegExp> = { TIKTOK: /^\d{8,25}$/, INSTAGRAM: /^[A-Za-z0-9_-]{5,40}$/, YOUTUBE: /^[A-Za-z0-9_-]{11}$/ }

/** Embed URL on the CSP-whitelisted player origins only. */
export function embedUrl(source: LinkSource, id: string): string | null {
  if (!ID_RE[source].test(id)) return null
  switch (source) {
    case 'TIKTOK':
      return `https://www.tiktok.com/player/v1/${id}?autoplay=1&rel=0&description=0&music_info=0`
    case 'INSTAGRAM':
      return `https://www.instagram.com/reel/${id}/embed/`
    case 'YOUTUBE':
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`
  }
}

export function canonicalVideoUrl(source: LinkSource, id: string, handle?: string | null): string | null {
  if (!ID_RE[source].test(id)) return null
  switch (source) {
    case 'TIKTOK':
      return handle && /^[a-zA-Z0-9_.]{2,24}$/.test(handle) ? `https://www.tiktok.com/@${handle}/video/${id}` : `https://www.tiktok.com/video/${id}`
    case 'INSTAGRAM':
      return `https://www.instagram.com/reel/${id}/`
    case 'YOUTUBE':
      return `https://www.youtube.com/shorts/${id}`
  }
}

export const SOURCE_LABEL: Record<LinkSource | 'UPLOAD', string> = { TIKTOK: 'TikTok', INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube', UPLOAD: 'Vidéo tresser' }
