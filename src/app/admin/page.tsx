import type { Metadata } from 'next'
import { db } from '@/server/db'
import { requireRole } from '@/server/guards'

export const metadata: Metadata = { title: 'Administration', robots: { index: false } }

export default async function AdminPage() {
  await requireRole('ADMIN', '/admin')
  const [users, products, pendingVideos] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.product.count(),
    db.socialVideo.count({ where: { moderation: 'PENDING' } }),
  ])
  const stats = [
    { label: 'Membres', value: users },
    { label: 'Produits', value: products },
    { label: 'Vidéos à modérer', value: pendingVideos },
  ]
  return (
    <section className="grid gap-6 pt-10">
      <h1 className="font-display text-3xl font-bold">Administration</h1>
      <dl className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="text-3xl font-bold">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
