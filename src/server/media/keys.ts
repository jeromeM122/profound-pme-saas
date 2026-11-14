/** Storage key conventions (pure, unit-tested). Keys embed the owner's id so access checks are cheap. */
export const KEY_RE = /^(progress|videos)\/([a-z0-9]{20,40})\/([a-z0-9]{32})\.(webp|mp4|mov|webm)$/

export const VIDEO_TYPES: Record<string, 'mp4' | 'mov' | 'webm'> = { 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' }
export const VIDEO_MAX_BYTES = 60 * 1024 * 1024
export const PHOTO_MAX_BYTES = 4 * 1024 * 1024

export function parseKey(key: string): { kind: 'progress' | 'videos'; ownerId: string; ext: string } | null {
  const m = KEY_RE.exec(key)
  return m ? { kind: m[1] as 'progress' | 'videos', ownerId: m[2]!, ext: m[4]! } : null
}

export function newKey(kind: 'progress' | 'videos', ownerId: string, ext: string): string {
  const id = crypto.randomUUID().replace(/-/g, '')
  const key = `${kind}/${ownerId}/${id}.${ext}`
  if (!KEY_RE.test(key)) throw new Error('Invalid storage key')
  return key
}

export function contentTypeFor(ext: string): string {
  return { webp: 'image/webp', mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm' }[ext] ?? 'application/octet-stream'
}

/** Parses a single "bytes=start-end" range (multi-range is not supported → full content). */
export function parseRange(header: string | null, size: number): { start: number; end: number } | null {
  if (!header) return null
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!m || (m[1] === '' && m[2] === '')) return null
  let start: number
  let end: number
  if (m[1] === '') {
    const suffix = Number(m[2])
    start = Math.max(0, size - suffix)
    end = size - 1
  } else {
    start = Number(m[1])
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1)
  }
  if (start > end || start >= size) return null
  return { start, end }
}
