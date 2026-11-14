import 'server-only'
import sharp from 'sharp'
import { PHOTO_MAX_BYTES } from './keys'

/**
 * Validates and re-encodes an uploaded photo: real image check (decoded by libvips, not trusted
 * from the file name / MIME), EXIF orientation applied, every metadata block dropped (GPS!),
 * max 1600 px, WebP.
 */
export async function processPhoto(input: Buffer): Promise<{ data: Buffer; width: number; height: number } | null> {
  if (input.length === 0 || input.length > PHOTO_MAX_BYTES) return null
  try {
    const meta = await sharp(input, { limitInputPixels: 40_000_000 }).metadata()
    if (!meta.format || !['jpeg', 'png', 'webp', 'heif', 'avif'].includes(meta.format)) return null
    const { data, info } = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true })
    return { data, width: info.width, height: info.height }
  } catch {
    return null
  }
}
