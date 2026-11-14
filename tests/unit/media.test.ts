import { describe, expect, it } from 'vitest'
import { newKey, parseKey, parseRange } from '@/server/media/keys'

describe('media keys', () => {
  const owner = 'cmhabcdefghijklmnopqrstuv'
  it('generates owner-scoped keys and parses them back', () => {
    const k = newKey('progress', owner, 'webp')
    expect(parseKey(k)).toEqual({ kind: 'progress', ownerId: owner, ext: 'webp' })
  })
  it.each(['../etc/passwd', 'progress/abc/x.webp', `videos/${owner}/../../x.mp4`, `videos/${owner}/${'a'.repeat(32)}.exe`, `other/${owner}/${'a'.repeat(32)}.mp4`])('rejects %s', (k) => {
    expect(parseKey(k)).toBeNull()
  })
})

describe('byte ranges', () => {
  it('parses single ranges', () => {
    expect(parseRange('bytes=0-1', 100)).toEqual({ start: 0, end: 1 })
    expect(parseRange('bytes=10-', 100)).toEqual({ start: 10, end: 99 })
    expect(parseRange('bytes=-20', 100)).toEqual({ start: 80, end: 99 })
    expect(parseRange('bytes=0-1000', 100)).toEqual({ start: 0, end: 99 })
  })
  it('rejects invalid or unsatisfiable ranges', () => {
    for (const h of ['bytes=200-300', 'bytes=50-10', 'bytes=-', 'items=0-1', 'bytes=0-1,5-6']) expect(parseRange(h, 100)).toBeNull()
    expect(parseRange(null, 100)).toBeNull()
  })
})
