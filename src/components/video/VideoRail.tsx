import 'server-only'
import type { HairTexture } from '@/generated/prisma/enums'
import { embedUrl, SOURCE_LABEL } from '@/lib/social/video'
import { TEXTURES } from '@/lib/hair/options'
import { db } from '@/server/db'
import { VideoFacade, type FacadeVideo } from './VideoFacade'

type Filter = { productIds?: string[]; submitterId?: string; textures?: HairTexture[]; viewerId?: string | null; limit?: number }

/** Approved videos (plus the viewer's own pending ones), mapped to safe facade props. */
export async function loadVideos(f: Filter): Promise<FacadeVideo[]> {
  const scope = { ...(f.productIds ? { productId: { in: f.productIds } } : {}), ...(f.submitterId ? { submitterId: f.submitterId } : {}) }
  const rows = await db.socialVideo.findMany({
    where: {
      ...scope,
      ...(f.textures?.length ? { texture: { in: f.textures } } : {}),
      OR: [{ moderation: 'APPROVED' }, ...(f.viewerId ? [{ moderation: 'PENDING' as const, submitterId: f.viewerId }] : [])],
    },
    orderBy: { createdAt: 'desc' },
    take: f.limit ?? 12,
    select: { id: true, platform: true, externalId: true, authorHandle: true, title: true, texture: true, moderation: true },
  })
  return rows.flatMap((r): FacadeVideo[] => {
    const src = r.platform === 'UPLOAD' ? `/api/media/${r.externalId}` : embedUrl(r.platform, r.externalId)
    if (!src) return []
    return [{ id: r.id, source: r.platform, src, sourceLabel: SOURCE_LABEL[r.platform], handle: r.authorHandle, caption: r.title, textureCode: r.texture ? TEXTURES[r.texture].code : null, pending: r.moderation === 'PENDING' }]
  })
}

export function VideoGrid({ videos }: { videos: FacadeVideo[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {videos.map((v) => (
        <li key={v.id}>
          <VideoFacade video={v} />
        </li>
      ))}
    </ul>
  )
}
