import type { SocialPlatform } from '@/generated/prisma/enums'

/**
 * Strict social-profile parsing. We NEVER store or fetch the user-supplied URL:
 * we extract a validated handle and rebuild the canonical URL ourselves (prevents XSS / SSRF / open redirects).
 */
type Rule = { hosts: readonly string[]; handle: RegExp; path: RegExp; reserved?: ReadonlySet<string>; url: (h: string) => string }

const RULES: Record<SocialPlatform, Rule> = {
  TIKTOK: {
    hosts: ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'],
    handle: /^[a-zA-Z0-9_.]{2,24}$/,
    path: /^\/@([^/]+)\/?$/,
    url: (h) => `https://www.tiktok.com/@${h}`,
  },
  INSTAGRAM: {
    hosts: ['instagram.com', 'www.instagram.com'],
    handle: /^[a-zA-Z0-9_.]{1,30}$/,
    path: /^\/([^/]+)\/?$/,
    reserved: new Set(['p', 'reel', 'reels', 'explore', 'stories', 'accounts', 'direct', 'tv', 'about', 'legal']),
    url: (h) => `https://www.instagram.com/${h}/`,
  },
  YOUTUBE: {
    hosts: ['youtube.com', 'www.youtube.com', 'm.youtube.com'],
    handle: /^[a-zA-Z0-9_.-]{3,30}$/,
    path: /^\/@([^/]+)\/?$/,
    url: (h) => `https://www.youtube.com/@${h}`,
  },
}

export type ParsedSocial = { platform: SocialPlatform; handle: string; url: string }

export function parseSocialProfile(platform: SocialPlatform, raw: string): ParsedSocial | null {
  const rule = RULES[platform]
  const input = raw.trim()
  if (!input || input.length > 200) return null

  let handle: string | undefined
  if (/^@?[^/:?#\s]+$/.test(input)) {
    handle = input.replace(/^@/, '')
  } else {
    let u: URL
    try {
      u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`)
    } catch {
      return null
    }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    if (u.username || u.password || u.port) return null
    if (!rule.hosts.includes(u.hostname.toLowerCase())) return null
    const m = rule.path.exec(u.pathname)
    if (!m?.[1]) return null
    handle = decodeURIComponentSafe(m[1])
  }
  if (!handle || !rule.handle.test(handle) || rule.reserved?.has(handle.toLowerCase())) return null
  if (handle.startsWith('.') || handle.endsWith('.')) return null
  return { platform, handle, url: rule.url(handle) }
}

export function canonicalSocialUrl(platform: SocialPlatform, handle: string): string | null {
  const rule = RULES[platform]
  return rule.handle.test(handle) ? rule.url(handle) : null
}

export const SOCIAL_LABEL: Record<SocialPlatform, string> = { TIKTOK: 'TikTok', INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube' }

function decodeURIComponentSafe(s: string): string | undefined {
  try {
    return decodeURIComponent(s)
  } catch {
    return undefined
  }
}
