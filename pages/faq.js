import Head from 'next/head'
export default function FAQ(){
  const faq = [
    { q: "Qu’est-ce que VisiIA ?", a: "Un tableau de bord simple pour savoir si votre entreprise apparaît dans les réponses d’IA et pour optimiser vos réseaux sociaux." },
    { q: "À qui s’adresse l’outil ?", a: "Aux PME/TPE françaises : commerces, artisans, restos, freelances, agences locales." },
    { q: "Combien ça coûte ?", a: "Freemium, puis Starter 29€/mois et Pro 79€/mois." },
  ]
  const jsonld = {
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity": faq.map(i => ({
      "@type":"Question",
      "name": i.q,
      "acceptedAnswer": {"@type":"Answer","text": i.a}
    }))
  }
  return (
    <div className="container">
      <Head>
        <title>FAQ — VisiIA</title>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonld)}} />
      </Head>
      <h1>FAQ</h1>
      <div className="stack">
        {faq.map((i,idx)=>(
          <div key={idx} className="card">
            <h3>{i.q}</h3><p className="small">{i.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
