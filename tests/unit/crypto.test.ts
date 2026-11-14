import { describe, expect, it } from 'vitest'
import { hashIp, signPayload, verifyPayload } from '@/server/security/crypto'

const SECRET = 'x'.repeat(32)

describe('signed payloads', () => {
  it('round-trips a payload', () => {
    const t = signPayload({ texture: 'T3B' }, SECRET, 60)
    expect(verifyPayload(t, SECRET)).toEqual({ texture: 'T3B' })
  })

  it('rejects a tampered body', () => {
    const t = signPayload({ role: 'USER' }, SECRET, 60)
    const [, sig] = t.split('.')
    const forged = Buffer.from(JSON.stringify({ v: { role: 'ADMIN' }, exp: 9e9 })).toString('base64url')
    expect(verifyPayload(`${forged}.${sig}`, SECRET)).toBeNull()
  })

  it('rejects a wrong secret, expiry and malformed tokens', () => {
    const t = signPayload(1, SECRET, 60, 0)
    expect(verifyPayload(t, 'y'.repeat(32), 0)).toBeNull()
    expect(verifyPayload(t, SECRET, 61_000)).toBeNull()
    for (const bad of [undefined, '', '.', 'a.b.c', 'x'.repeat(5000)]) expect(verifyPayload(bad, SECRET)).toBeNull()
  })
})

describe('hashIp', () => {
  it('is deterministic, keyed and does not leak the IP', () => {
    const h = hashIp('203.0.113.7', SECRET)
    expect(h).toBe(hashIp('203.0.113.7', SECRET))
    expect(h).not.toBe(hashIp('203.0.113.7', 'z'.repeat(32)))
    expect(h).not.toContain('203')
  })
})
