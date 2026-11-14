'use client'

import { useActionState } from 'react'
import { updateProfile, type FormState } from '@/app/compte/actions'

type Props = { defaults: { handle: string; name: string; bio: string; isPublic: boolean; badgePublic: boolean }; hasDiagnostic: boolean }

export function ProfileForm({ defaults, hasDiagnostic }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {})
  const err = (k: string) =>
    state.errors?.[k] ? (
      <p id={`${k}-err`} className="text-sm font-bold text-citron">
        {state.errors[k]}
      </p>
    ) : null

  return (
    <form action={action} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <label htmlFor="handle" className="text-sm font-bold">
          Pseudo public
        </label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-gris">@</span>
          <input id="handle" name="handle" defaultValue={defaults.handle} required minLength={3} maxLength={30} autoComplete="username" aria-describedby="handle-err" className="field font-mono" />
        </div>
        {err('handle')}
      </div>
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-bold">
          Nom affiché
        </label>
        <input id="name" name="name" defaultValue={defaults.name} maxLength={60} autoComplete="name" aria-describedby="name-err" className="field" />
        {err('name')}
      </div>
      <div className="grid gap-2">
        <label htmlFor="bio" className="text-sm font-bold">
          Bio
        </label>
        <textarea id="bio" name="bio" defaultValue={defaults.bio} maxLength={280} rows={4} aria-describedby="bio-err" className="field py-3" />
        {err('bio')}
      </div>
      <label className="flex items-start gap-3">
        <input type="checkbox" name="isPublic" defaultChecked={defaults.isPublic} className="mt-1 size-5 accent-citron" />
        <span>
          <span className="font-bold">Profil public</span>
          <span className="block text-sm text-gris">Visible par tous sur tresser.fr/@pseudo, et dans les jumelles capillaires.</span>
        </span>
      </label>
      <label className={`flex items-start gap-3 ${hasDiagnostic ? '' : 'opacity-50'}`}>
        <input type="checkbox" name="badgePublic" defaultChecked={defaults.badgePublic} disabled={!hasDiagnostic} className="mt-1 size-5 accent-citron" />
        <span>
          <span className="font-bold">Afficher mon badge capillaire</span>
          <span className="block text-sm text-gris">Ta texture, ta porosité et ta routine principale apparaîtront sur ton profil public.</span>
        </span>
      </label>
      {state.message && (
        <p role="status" className={`text-sm font-bold ${state.ok ? 'text-citron' : 'text-ivoire'}`}>
          {state.message}
        </p>
      )}
      <button disabled={pending} className="btn-primary w-fit">
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}
