import { describe, expect, it } from 'vitest'
import { canonicalVideoUrl, embedUrl, parseVideoUrl } from '@/lib/social/video'

describe('video links', () => {
  it('parses real TikTok, Instagram and YouTube links', () => {
    expect(parseVideoUrl('https://www.tiktok.com/@curly.awa/video/7312345678901234567?lang=fr')).toEqual({ source: 'TIKTOK', id: '7312345678901234567', handle: 'curly.awa' })
    expect(parseVideoUrl('https://www.instagram.com/reel/C9xYz_ab12/?igsh=abc')).toEqual({ source: 'INSTAGRAM', id: 'C9xYz_ab12', handle: null })
    expect(parseVideoUrl('instagram.com/p/C9xYz_ab12/')?.id).toBe('C9xYz_ab12')
    expect(parseVideoUrl('https://youtube.com/shorts/dQw4w9WgXcQ')?.id).toBe('dQw4w9WgXcQ')
    expect(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')?.id).toBe('dQw4w9WgXcQ')
    expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')?.source).toBe('YOUTUBE')
  })

  it.each([
    'https://vm.tiktok.com/ZMabc123/',
    'https://www.tiktok.com.evil.com/@a/video/7312345678901234567',
    'https://evil.com/?u=https://www.tiktok.com/@a/video/7312345678901234567',
    'https://user@www.tiktok.com/@ab/video/7312345678901234567',
    'https://www.tiktok.com/@ab/video/7312345678901234567/../../x',
    'javascript:alert(1)',
    'https://www.instagram.com/stories/someone/123/',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/embed/dQw4w9WgXcQ"><script>',
    'ftp://youtu.be/dQw4w9WgXcQ',
  ])('refuses %s', (u) => {
    expect(parseVideoUrl(u)).toBeNull()
  })

  it('rebuilds embed URLs only on whitelisted player origins, from validated ids', () => {
    expect(embedUrl('TIKTOK', '7312345678901234567')).toMatch(/^https:\/\/www\.tiktok\.com\/player\/v1\/7312345678901234567\?/)
    expect(embedUrl('INSTAGRAM', 'C9xYz_ab12')).toBe('https://www.instagram.com/reel/C9xYz_ab12/embed/')
    expect(embedUrl('YOUTUBE', 'dQw4w9WgXcQ')).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/)
    expect(embedUrl('YOUTUBE', 'x"><img')).toBeNull()
    expect(canonicalVideoUrl('TIKTOK', '7312345678901234567', 'curly.awa')).toBe('https://www.tiktok.com/@curly.awa/video/7312345678901234567')
  })
})
