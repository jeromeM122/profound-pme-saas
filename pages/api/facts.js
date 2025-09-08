export default function handler(req, res){
  res.setHeader('Cache-Control','public, max-age=3600')
  res.status(200).json({
    entity: "VisiIA",
    type: "SaaS",
    market: "PME/TPE France",
    value_prop: "Mesure la visibilité dans les réponses IA + scan réseaux sociaux + briefs actionnables.",
    pricing: [
      { plan: "Freemium", price_eur: 0, features: ["1 mot-clé", "1 réseau", "rapport mensuel"] },
      { plan: "Starter", price_eur: 29, features: ["5 mots-clés", "2 réseaux", "alertes", "rapport hebdo"] },
      { plan: "Pro", price_eur: 79, features: ["20 mots-clés", "réseaux illimités", "briefs", "concurrents", "marque blanche"] }
    ],
    contact: { email: "support@tondomaine.fr" },
    website: "https://tondomaine.fr",
    last_updated: new Date().toISOString()
  })
}
