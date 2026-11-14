import { describe, expect, it } from 'vitest'
import { canonicalSocialUrl, parseSocialProfile } from '@/lib/social/parse'
import { profileFormSchema } from '@/lib/validators/auth'

describe('social profile parsing', () => {
  it('accepts handles and official URLs, returns canonical URLs', () => {
    expect(parseSocialProfile('TIKTOK', '@curly.awa')).toEqual({ platform: 'TIKTOK', handle: 'curly.awa', url: 'https://www.tiktok.com/@curly.awa' })
    expect(parseSocialProfile('TIKTOK', 'https://www.tiktok.com/@curly.awa?lang=fr')?.handle).toBe('curly.awa')
    expect(parseSocialProfile('INSTAGRAM', 'instagram.com/awa_4c/')?.url).toBe('https://www.instagram.com/awa_4c/')
    expect(parseSocialProfile('YOUTUBE', 'https://m.youtube.com/@AwaHair')?.url).toBe('https://www.youtube.com/@AwaHair')
  })

  it.each([
    ['TIKTOK', 'https://tiktok.com.evil.com/@x'],
    ['TIKTOK', 'https://evil.com/?u=tiktok.com/@xx'],
    ['TIKTOK', 'https://user:pw@tiktok.com/@xx'],
    ['TIKTOK', 'https://tiktok.com:8443/@xx'],
    ['TIKTOK', 'javascript:alert(1)'],
    ['TIKTOK', 'https://www.tiktok.com/@xx/video/123'],
    ['TIKTOK', '@<script>'],
    ['TIKTOK', '@%3Cscript%3E'],
    ['INSTAGRAM', 'https://www.instagram.com/p/Cabc123/'],
    ['INSTAGRAM', 'https://www.instagram.com/explore'],
    ['INSTAGRAM', 'ftp://instagram.com/awa'],
    ['YOUTUBE', 'https://www.youtube.com/watch?v=abc'],
    ['YOUTUBE', 'https://youtu.be/@abc'],
    ['YOUTUBE', '.hidden.'],
  ] as const)('rejects %s %s', (platform, input) => {
    expect(parseSocialProfile(platform, input)).toBeNull()
  })

  it('never builds a URL from an invalid stored handle', () => {
    expect(canonicalSocialUrl('TIKTOK', 'x"><img')).toBeNull()
  })
})

describe('profile form', () => {
  it('cleans control / bidi characters and limits length', () => {
    const r = profileFormSchema.parse({ handle: 'Awa.4C', name: ' Awa‮ ', bio: 'Hello\n\n\n\nmonde\u0007', isPublic: true, badgePublic: false })
    expect(r).toEqual({ handle: 'awa.4c', name: 'Awa', bio: 'Hello\n\nmonde', isPublic: true, badgePublic: false })
    expect(profileFormSchema.safeParse({ handle: 'awa', name: 'x'.repeat(61), bio: '', isPublic: true, badgePublic: true }).success).toBe(false)
  })
})
