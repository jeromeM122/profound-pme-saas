import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/server/auth'
import { parseKey, VIDEO_MAX_BYTES, VIDEO_TYPES } from '@/server/media/keys'

/** Issues a short-lived client-upload token for one server-chosen key owned by the signed-in member. */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth()
        const k = parseKey(pathname)
        if (!session?.user?.id || !k || k.kind !== 'videos' || k.ownerId !== session.user.id) throw new Error('Unauthorized')
        return {
          allowedContentTypes: Object.keys(VIDEO_TYPES),
          maximumSizeInBytes: VIDEO_MAX_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
          validUntil: Date.now() + 10 * 60 * 1000,
        }
      },
    })
    return NextResponse.json(json)
  } catch {
    return NextResponse.json({ error: 'upload_refused' }, { status: 400 })
  }
}
