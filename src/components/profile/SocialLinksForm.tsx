'use client'

import { useActionState } from 'react'
import type { SocialPlatform } from '@/generated/prisma/enums'
import { removeSocialLink, saveSocialLink, type FormState } from '@/app/compte/actions'
import { SOCIAL_LABEL } from '@/lib/social/parse'

const PLACEHOLDER: Record<SocialPlatform, string> = {
  TIKTOK: '@pseudo ou tiktok.com/@pseudo',
  INSTAGRAM: '@pseudo ou instagram.com/pseudo',
  YOUTUBE: '@chaine ou youtube.com/@chaine',
}

function Row({ platform, current }: { platform: SocialPlatform; current?: { handle: string; url: string } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSocialLink, {})
  const error = state.errors?.[platform]
  return (
    <div className="grid gap-2 border-b border-encre/10 pb-4 last:border-0 last:pb-0">
      <p className="text-sm font-normal">{SOCIAL_LABEL[platform]}</p>
      {current ? (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-sable px-4 py-3">
          <a href={current.url} target="_blank" rel="noopener noreferrer nofollow" className="font-mono hover:text-or">
            @{current.handle}
          </a>
          <form action={removeSocialLink}>
            <input type="hidden" name="platform" value={platform} />
            <button className="text-sm text-taupe underline underline-offset-4 hover:text-or">Retirer</button>
          </form>
        </div>
      ) : (
        <form action={action} className="flex gap-2">
          <input type="hidden" name="platform" value={platform} />
          <label className="sr-only" htmlFor={`social-${platform}`}>
            {SOCIAL_LABEL[platform]}
          </label>
          <input id={`social-${platform}`} name="value" maxLength={200} placeholder={PLACEHOLDER[platform]} aria-invalid={!!error} className="field" />
          <button disabled={pending} className="btn-ghost shrink-0 px-4">
            Ajouter
          </button>
        </form>
      )}
      {error && <p className="text-sm font-normal text-or">{error}</p>}
    </div>
  )
}

export function SocialLinksForm({ links }: { links: Partial<Record<SocialPlatform, { handle: string; url: string }>> }) {
  return (
    <div className="grid gap-4">
      {(['TIKTOK', 'INSTAGRAM', 'YOUTUBE'] as const).map((p) => (
        <Row key={p} platform={p} current={links[p]} />
      ))}
    </div>
  )
}
