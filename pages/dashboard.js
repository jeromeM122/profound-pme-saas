import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'

export default function Dashboard(){
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ business: '', website: '', socials: '', keywords: 'restaurant, pizzeria, livraison' })
  const [data, setData] = useState(null)
  const [briefs, setBriefs] = useState([])
  const [mentions, setMentions] = useState([])

  useEffect(()=>{
    const saved = localStorage.getItem('visii_form')
    if(saved){ setForm(JSON.parse(saved)) }
  },[])

  const runAudit = async () => {
    setLoading(true)
    localStorage.setItem('visii_form', JSON.stringify(form))
    const [visRes, socRes, brRes] = await Promise.all([
      fetch('/api/visibility?website='+encodeURIComponent(form.website)+'&keywords='+encodeURIComponent(form.keywords)).then(r=>r.json()),
      fetch('/api/social?socials='+encodeURIComponent(form.socials)).then(r=>r.json()),
      fetch('/api/briefs?business='+encodeURIComponent(form.business)+'&keywords='+encodeURIComponent(form.keywords)).then(r=>r.json())
    ])
    setData(visRes)
    setMentions(socRes.mentions)
    setBriefs(brRes.briefs)
    setLoading(false)
  }

  const exportPDF = async () => {
    const res = await fetch('/api/report', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data, mentions, briefs, form }) })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'rapport-visibilite.pdf'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Navbar/>
      <div className="container">
        <h1>Dashboard</h1>
        <p className="small">Entrez votre entreprise et lancez un audit gratuit. (Données de démonstration tant que les clés API ne sont pas configurées.)</p>
        <div className="grid">
          <div className="card">
            <h3>Paramètres</h3>
            <div className="stack">
              <input className="input" value={form.business} placeholder="Nom de l'entreprise" onChange={e=>setForm({...form, business:e.target.value})}/>
              <input className="input" value={form.website} placeholder="Site web (https://...)" onChange={e=>setForm({...form, website:e.target.value})}/>
              <input className="input" value={form.socials} placeholder="Liens réseaux (virgule)" onChange={e=>setForm({...form, socials:e.target.value})}/>
              <textarea className="textarea" rows={3} value={form.keywords} placeholder="Mots-clés (séparés par des virgules)" onChange={e=>setForm({...form, keywords:e.target.value})}/>
              <div className="flex">
                <button className="btn" onClick={runAudit} disabled={loading}>{loading?'Analyse...':'Lancer l’audit'}</button>
                <button className="btn secondary" onClick={exportPDF} disabled={!data}>Exporter PDF</button>
              </div>
            </div>
          </div>
          <div className="card">
            <h3>Score visibilité IA</h3>
            {data ? (<>
              <div className="kpi">
                <div className="small">Présence estimée</div>
                <div className="value">{Math.round(data.score*100)}%</div>
                <div className="progress"><div style={{width: (data.score*100)+'%'}}/></div>
              </div>
              <table className="table">
                <thead><tr><th>Concurrents</th><th>Score</th><th>Status</th></tr></thead>
                <tbody>
                  {data.competitors.map((c,i)=>(
                    <tr key={i}>
                      <td>{c.name}</td>
                      <td>{Math.round(c.score*100)}%</td>
                      <td><span className="badge">{c.score>data.score?'↑ devant':'≈/↓ derrière'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>) : <p className="small">Aucune donnée. Lancez l’audit.</p>}
          </div>
          <div className="card">
            <h3>Mentions Réseaux (30 jours)</h3>
            {mentions.length? (
              <table className="table">
                <thead><tr><th>Source</th><th>Auteur</th><th>Extrait</th></tr></thead>
                <tbody>
                  {mentions.map((m,i)=>(
                    <tr key={i}>
                      <td>{m.source}</td>
                      <td>{m.author}</td>
                      <td className="small">{m.snippet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="small">Aucune mention détectée (données démo si API non configurée).</p>}
          </div>
          <div className="card">
            <h3>Briefs prêts-à-poster</h3>
            {briefs.length? (
              <ul className="small">
                {briefs.map((b,i)=>(<li key={i}>• {b}</li>))}
              </ul>
            ) : <p className="small">Aucun brief disponible.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
