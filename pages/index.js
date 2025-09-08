import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function Home(){
  return (
    <div>
      <Navbar/>
      <div className="container">
        <div className="hero">
          <div className="stack">
            <h1>Êtes-vous visible dans les réponses IA ?</h1>
            <p className="small">Le tableau de bord simple qui mesure votre présence dans ChatGPT / Perplexity et scanne vos réseaux sociaux (Facebook, Instagram, LinkedIn, Google Reviews).</p>
            <div className="cta">
              <Link className="btn" href="/dashboard">Tester gratuitement</Link>
              <Link className="btn secondary" href="/pricing">Voir les tarifs</Link>
            </div>
            <div className="card notice">
              <b>Nouveau :</b> Alertes email quand un concurrent prend une place IA, et briefs prêts-à-poster pour vos réseaux.
            </div>
          </div>
          <div className="card">
            <h3>Aperçu du rapport</h3>
            <div className="grid">
              <div className="kpi">
                <div className="small">Score visibilité IA</div>
                <div className="value">42%</div>
                <div className="progress"><div style={{width:'42%'}}/></div>
              </div>
              <div className="kpi">
                <div className="small">Mentions sociales (30j)</div>
                <div className="value">68</div>
              </div>
              <div className="kpi">
                <div className="small">Avis Google</div>
                <div className="value">4.5★</div>
              </div>
            </div>
            <p className="small">Exemple illustratif. Obtenez vos propres chiffres en 60 secondes.</p>
          </div>
        </div>
        <div style={{marginTop: 24}} className="grid">
          <div className="card">
            <h3>Scan Réseaux</h3>
            <p className="small">Analyse de vos profils Facebook, Instagram, LinkedIn et Google Reviews. Détection des mentions, hashtags et tonalité.</p>
          </div>
          <div className="card">
            <h3>Visibilité IA</h3>
            <p className="small">Mesure la présence de votre marque dans les réponses des IA conversationnelles, avec comparaison de 3 concurrents locaux.</p>
          </div>
          <div className="card">
            <h3>Briefs Actionnables</h3>
            <p className="small">Recommandations et modèles prêts à poster : posts, carrousels, réponses clients.</p>
          </div>
        </div>
        <div className="footer container small">© {new Date().getFullYear()} VisiIA — Fait pour les PME/TPE françaises.</div>
      </div>
    </div>
  )
}
