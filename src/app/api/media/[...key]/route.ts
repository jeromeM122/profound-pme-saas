import { NextResponse, type NextRequest } from 'next/server'
import { hasRole } from '@/server/rbac'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { objectSize, getObject } from '@/server/media/storage'
import { parseKey, parseRange } from '@/server/media/keys'

/**
 * Serves private media after an access check:
 *  - progress photos: owner only;
 *  - videos: anyone once approved, otherwise the submitter and moderators.
 * Supports single byte ranges (required by Safari for video playback).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join('/')
  const parsed = parseKey(key)
  if (!parsed) return new NextResponse(null, { status: 404 })
  const session = await auth()
  const viewer = session?.user

  let cache = 'private, no-store'
  if (parsed.kind === 'progress') {
    if (!viewer || viewer.id !== parsed.ownerId) return new NextResponse(null, { status: 404 })
    const entry = await db.progressEntry.findUnique({ where: { photoKey: key }, select: { userId: true } })
    if (!entry || entry.userId !== viewer.id) return new NextResponse(null, { status: 404 })
  } else {
    const video = await db.socialVideo.findFirst({ where: { platform: 'UPLOAD', externalId: key }, select: { moderation: true, submitterId: true } })
    if (!video) return new NextResponse(null, { status: 404 })
    const allowed = video.moderation === 'APPROVED' || viewer?.id === video.submitterId || hasRole(viewer?.role, 'MODERATOR')
    if (!allowed) return new NextResponse(null, { status: 404 })
    if (video.moderation === 'APPROVED') cache = 'private, max-age=3600'
  }

  const info = await objectSize(key)
  if (!info) return new NextResponse(null, { status: 404 })
  const range = parseRange(req.headers.get('range'), info.size)
  if (req.headers.get('range') && !range) {
    return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${info.size}` } })
  }
  const obj = await getObject(key, range)
  if (!obj) return new NextResponse(null, { status: 404 })

  const headers = new Headers({
    'Content-Type': obj.contentType,
    'Cache-Control': cache,
    'Accept-Ranges': 'bytes',
    'Content-Disposition': 'inline',
    'Cross-Origin-Resource-Policy': 'same-origin',
  })
  if (obj.range) {
    headers.set('Content-Range', `bytes ${obj.range.start}-${obj.range.end}/${info.size}`)
    headers.set('Content-Length', String(obj.range.end - obj.range.start + 1))
    return new NextResponse(obj.stream, { status: 206, headers })
  }
  headers.set('Content-Length', String(info.size))
  return new NextResponse(obj.stream, { status: 200, headers })
}
