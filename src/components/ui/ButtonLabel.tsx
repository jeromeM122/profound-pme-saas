/** Button text with the vertical "roll" hover effect (see .btn-roll in globals.css). */
export function ButtonLabel({ children }: { children: string }) {
  return (
    <span className="btn-mask">
      <span className="btn-roll">{children}</span>
    </span>
  )
}
