import 'server-only'
import { createReadStream } from 'node:fs'
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { del, get, head, put } from '@vercel/blob'
import { contentTypeFor } from './keys'

/**
 * Private media storage. Production: Vercel Blob (private store). Local development without a
 * Blob token: files under .data/uploads (refused on Vercel).
 */
export type StoredObject = { stream: ReadableStream<Uint8Array>; size: number; contentType: string; range?: { start: number; end: number } }

export function storageMode(): 'blob' | 'local' {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob'
  if (process.env.VERCEL) throw new Error('Media storage requires a Vercel Blob store (BLOB_READ_WRITE_TOKEN)')
  return 'local'
}

const LOCAL_ROOT = path.join(process.cwd(), '.data', 'uploads')
const localPath = (key: string) => {
  const p = path.join(LOCAL_ROOT, key)
  if (!p.startsWith(LOCAL_ROOT + path.sep)) throw new Error('Invalid key')
  return p
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  if (storageMode() === 'blob') {
    await put(key, body, { access: 'private', contentType, addRandomSuffix: false, allowOverwrite: false })
  } else {
    await mkdir(path.dirname(localPath(key)), { recursive: true })
    await writeFile(localPath(key), body, { flag: 'wx' })
  }
}

export async function objectSize(key: string): Promise<{ size: number; contentType: string } | null> {
  try {
    if (storageMode() === 'blob') {
      const h = await head(key)
      return { size: h.size, contentType: h.contentType }
    }
    const s = await stat(localPath(key))
    return { size: s.size, contentType: contentTypeFor(key.split('.').pop() ?? '') }
  } catch {
    return null
  }
}

export async function getObject(key: string, range: { start: number; end: number } | null): Promise<StoredObject | null> {
  if (storageMode() === 'blob') {
    const r = await get(key, { access: 'private', ...(range ? { headers: { Range: `bytes=${range.start}-${range.end}` } } : {}) })
    if (!r || r.statusCode !== 200 || !r.stream) return null
    const total = Number(r.headers.get('content-range')?.split('/')[1] ?? r.blob.size)
    const partial = r.headers.get('content-range') ? range ?? undefined : undefined
    return { stream: r.stream, size: total, contentType: r.blob.contentType, range: partial }
  }
  try {
    const p = localPath(key)
    const s = await stat(p)
    const stream = Readable.toWeb(createReadStream(p, range ? { start: range.start, end: range.end } : {})) as ReadableStream<Uint8Array>
    return { stream, size: s.size, contentType: contentTypeFor(key.split('.').pop() ?? ''), range: range ?? undefined }
  } catch {
    return null
  }
}

export async function deleteObject(key: string) {
  try {
    if (storageMode() === 'blob') await del(key)
    else await rm(localPath(key), { force: true })
  } catch (err) {
    console.error('[media] delete failed', err instanceof Error ? err.message : err)
  }
}
