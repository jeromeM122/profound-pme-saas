import { toggleFollow } from '@/app/membre/actions'

export function FollowButton({ targetId, following, path, compact = false }: { targetId: string; following: boolean; path: string; compact?: boolean }) {
  return (
    <form action={toggleFollow}>
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="path" value={path} />
      <button className={`${following ? 'btn-ghost' : 'btn-primary'} ${compact ? 'min-h-10 px-4' : ''}`} aria-pressed={following}>
        {following ? 'Suivi·e' : 'Suivre'}
      </button>
    </form>
  )
}
