import type { Metadata } from 'next'
import Link from 'next/link'
import { moderateVideo } from '@/app/videos/actions'
import { VideoFacade } from '@/components/video/VideoFacade'
import { canonicalVideoUrl, embedUrl, SOURCE_LABEL } from '@/lib/social/video'
import { TEXTURES } from '@/lib/hair/options'
import { db } from '@/server/db'
import { requireRole } from '@/server/guards'

export const metadata: Metadata = { title: 'Modération des vidéos', robots: { index: false } }

export default async function VideosModerationPage() {
  await requireRole('MODERATOR', '/admin/videos')
  const pending = await db.socialVideo.findMany({
    where: { moderation: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: { id: true, platform: true, externalId: true, authorHandle: true, title: true, texture: true, createdAt: true, product: { select: { name: true, slug: true } }, submitter: { select: { handle: true, email: true } } },
  })
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-14 pb-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">Vidéos à modérer</h1>
        <Link href="/admin" className="kicker text-[0.6rem] text-taupe hover:text-or">← Administration</Link>
      </div>
      {pending.length === 0 ? (
        <p className="card text-taupe">Aucune vidéo en attente.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((v) => {
            const src = v.platform === 'UPLOAD' ? `/api/media/${v.externalId}` : embedUrl(v.platform, v.externalId)
            const original = v.platform === 'UPLOAD' ? null : canonicalVideoUrl(v.platform, v.externalId, v.authorHandle)
            return (
              <li key={v.id} className="card grid gap-4">
                {src && <VideoFacade video={{ id: v.id, source: v.platform, src, sourceLabel: SOURCE_LABEL[v.platform], handle: v.authorHandle, caption: v.title, textureCode: v.texture ? TEXTURES[v.texture].code : null }} />}
                <div className="grid gap-1 text-sm">
                  <p>Par {v.submitter.handle ? `@${v.submitter.handle}` : v.submitter.email}</p>
                  {v.product && <Link href={`/produits/${v.product.slug}` as '/produits'} className="text-or hover:underline">{v.product.name}</Link>}
                  {original && <a href={original} target="_blank" rel="noopener noreferrer nofollow" className="text-xs text-taupe underline">Voir l’original</a>}
                </div>
                <div className="flex gap-2">
                  {(['APPROVED', 'REJECTED'] as const).map((d) => (
                    <form key={d} action={moderateVideo}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="decision" value={d} />
                      <button className={d === 'APPROVED' ? 'btn-primary min-h-10 px-4' : 'btn-ghost min-h-10 px-4'}>{d === 'APPROVED' ? 'Publier' : 'Refuser'}</button>
                    </form>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
