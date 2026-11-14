import type { Metadata } from 'next'
import { db } from '@/server/db'
import { requireRole } from '@/server/guards'

export const metadata: Metadata = { title: 'Administration', robots: { index: false } }

export default async function AdminPage() {
  await requireRole('ADMIN', '/admin')
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000)
  const human = { createdAt: { gte: since }, uaBot: false }
  const [users, products, pendingVideos, clicks, bots, byOffer, bySource] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.product.count({ where: { status: 'ACTIVE' } }),
    db.socialVideo.count({ where: { moderation: 'PENDING' } }),
    db.clickEvent.count({ where: human }),
    db.clickEvent.count({ where: { createdAt: { gte: since }, uaBot: true } }),
    db.clickEvent.groupBy({ by: ['offerId'], where: human, _count: { _all: true }, orderBy: { _count: { offerId: 'desc' } }, take: 10 }),
    db.clickEvent.groupBy({ by: ['sourcePath'], where: human, _count: { _all: true }, orderBy: { _count: { sourcePath: 'desc' } }, take: 10 }),
  ])
  const offers = await db.affiliateOffer.findMany({
    where: { id: { in: byOffer.map((o) => o.offerId) } },
    select: { id: true, product: { select: { name: true } }, merchant: { select: { name: true } } },
  })
  const offerName = new Map(offers.map((o) => [o.id, `${o.product.name} · ${o.merchant.name}`]))
  const stats = [
    { label: 'Membres', value: users },
    { label: 'Produits actifs', value: products },
    { label: 'Clics « Acheter » (30 j)', value: clicks },
    { label: 'Vidéos à modérer', value: pendingVideos },
  ]
  const table = (title: string, rows: { k: string; v: number }[]) => (
    <section className="card grid content-start gap-4">
      <h2 className="kicker text-encre">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-taupe">Aucun clic pour l’instant.</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} className="border-b border-ligne last:border-0">
                <td className="py-2 pr-4">{r.k}</td>
                <td className="py-2 text-right font-mono text-or">{r.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-14 pb-24 sm:px-6">
      <h1 className="display text-4xl sm:text-5xl">Administration</h1>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <dt className="kicker text-[0.6rem] text-taupe">{s.label}</dt>
            <dd className="mt-2 text-3xl font-light">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-4 lg:grid-cols-2">
        {table('Produits les plus cliqués (30 j)', byOffer.map((o) => ({ k: offerName.get(o.offerId) ?? o.offerId, v: o._count._all })))}
        {table('Pages qui génèrent les clics (30 j)', bySource.map((s) => ({ k: s.sourcePath, v: s._count._all })))}
      </div>
      <p className="text-xs text-taupe">Hors robots ({bots} clics automatiques écartés). Adresses IP jamais stockées en clair.</p>
    </section>
  )
}
