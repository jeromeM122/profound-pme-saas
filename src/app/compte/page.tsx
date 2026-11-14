import type { Metadata } from 'next'
import { requireUser } from '@/server/guards'
import { logout } from './actions'

export const metadata: Metadata = { title: 'Mon compte', robots: { index: false } }

const ROLE_LABEL = { USER: 'Membre', CREATOR: 'Créatrice', MODERATOR: 'Modération', ADMIN: 'Administration' } as const

export default async function ComptePage() {
  const user = await requireUser('/compte')
  return (
    <section className="grid gap-6 pt-10">
      <h1 className="font-display text-3xl font-bold">Mon compte</h1>
      <div className="card grid gap-2">
        <p>
          <span className="text-muted">E-mail :</span> {user.email}
        </p>
        <p>
          <span className="text-muted">Rôle :</span> {ROLE_LABEL[user.role]}
        </p>
      </div>
      <form action={logout}>
        <button className="btn-outline">Se déconnecter</button>
      </form>
    </section>
  )
}
