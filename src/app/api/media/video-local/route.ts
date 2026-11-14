import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/server/auth'
import { parseKey, VIDEO_MAX_BYTES, VIDEO_TYPES } from '@/server/media/keys'
import { putObject, storageMode } from '@/server/media/storage'

/** Local development only (no Blob store): receives the video file directly. */
export async function POST(req: NextRequest) {
  if (storageMode() !== 'local') return NextResponse.json({ error: 'not_available' }, { status: 404 })
  const session = await auth()
  const form = await req.formData()
  const key = String(form.get('key') ?? '')
  const file = form.get('file')
  const k = parseKey(key)
  if (!session?.user?.id || !k || k.kind !== 'videos' || k.ownerId !== session.user.id) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  if (!(file instanceof File) || !VIDEO_TYPES[file.type] || file.size > VIDEO_MAX_BYTES) return NextResponse.json({ error: 'invalid_file' }, { status: 400 })
  await putObject(key, Buffer.from(await file.arrayBuffer()), file.type)
  return NextResponse.json({ ok: true })
}
