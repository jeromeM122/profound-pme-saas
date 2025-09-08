import Navbar from '../components/Navbar'

function Plan({name, price, features, href}){
  return (
    <div className="card" style={{display:'grid', gap:12}}>
      <h3>{name}</h3>
      <div style={{fontSize:28, fontWeight:800}}>{price}</div>
      <ul className="small">
        {features.map((f,i)=><li key={i}>• {f}</li>)}
      </ul>
      <a className="btn" href={href}>Choisir</a>
    </div>
  )
}

export default function Pricing(){
  return (
    <div>
      <Navbar/>
      <div className="container">
        <h1>Des tarifs simples</h1>
        <p className="small">Commencez gratuitement. Passez au plan adapté quand vous êtes prêt.</p>
        <div className="grid">
          <Plan name="Freemium" price="0€" href="/dashboard" features={[
            "1 mot-clé IA",
            "Scan 1 réseau social",
            "Rapport mensuel"
          ]}/>
          <Plan name="Starter" price="29€/mois" href="https://buy.stripe.com/test_000000" features={[
            "5 mots-clés IA",
            "Scan 2 réseaux",
            "Rapport hebdomadaire",
            "Alertes email"
          ]}/>
          <Plan name="Pro" price="79€/mois" href="https://buy.stripe.com/test_000000" features={[
            "20 mots-clés IA",
            "Scan réseaux illimité",
            "Briefs prêts-à-poster",
            "Comparaison concurrents",
            "Rapport marque blanche"
          ]}/>
          <Plan name="Agency" price="199€/mois" href="https://buy.stripe.com/test_000000" features={[
            "200 mots-clés IA",
            "Multi-clients",
            "API & Webhooks",
            "Alertes Slack/Teams"
          ]}/>
        </div>
      </div>
    </div>
  )
}
