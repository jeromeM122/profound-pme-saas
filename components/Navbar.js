import Link from 'next/link'

export default function Navbar(){
  return (
    <div className="nav container">
      <div className="brand">VisiIA • PME/TPE</div>
      <div>
        <Link href="/">Accueil</Link>
        <Link href="/pricing">Tarifs</Link>
        <Link href="/dashboard">Dashboard</Link>
        <a href="mailto:support@example.com">Support</a>
      </div>
    </div>
  )
}
