import type { Metadata } from 'next'
import { requireUser } from '@/server/guards'
import { logout } from './actions'

export const metadata: Metadata = { title: 'Mon compte', robots: { index: false } }

const ROLE_LABEL = { USER: 'Membre', CREATOR: 'Créatrice', MODERATOR: 'Modération', ADMIN: 'Administration' } as const

export default async function ComptePage() {
  const user = await requireUser('/compte')
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 pt-32 pb-16 sm:px-6">
      <h1 className="display text-4xl sm:text-5xl">Mon compte</h1>
      <div className="card grid gap-2">
        <p>
          <span className="text-gris">E-mail :</span> {user.email}
        </p>
        <p>
          <span className="text-gris">Rôle :</span> {ROLE_LABEL[user.role]}
        </p>
      </div>
      <form action={logout}>
        <button className="btn-ghost">Se déconnecter</button>
      </form>
    </section>
  )
}
