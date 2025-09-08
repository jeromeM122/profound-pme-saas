export default async function handler(req, res){
  // Very basic PDF generation using HTML -> pdf via browser is ideal. Here we return a simple text blob as PDF-like.
  // In production, integrate a real PDF service (e.g., pdf-lib, puppeteer on a server).
  const { data, mentions, briefs, form } = req.body || {}
  const lines = []
  lines.push('RAPPORT VISIBILITÉ IA & RESEAUX — ' + (form?.business || 'Entreprise'))
  lines.push('Site: ' + (form?.website || '-'))
  lines.push('Mots-clés: ' + (form?.keywords || '-'))
  lines.push('')
  lines.push('Score IA: ' + Math.round((data?.score||0)*100) + '%')
  lines.push('Concurrents:')
  ;(data?.competitors||[]).forEach(c=>lines.push(` - ${c.name}: ${Math.round(c.score*100)}%`))
  lines.push('')
  lines.push('Mentions (30j):')
  ;(mentions||[]).forEach(m=>lines.push(` - [${m.source}] ${m.author}: ${m.snippet}`))
  lines.push('')
  lines.push('Briefs à publier:')
  ;(briefs||[]).forEach(b=>lines.push(` - ${b}`))
  const content = lines.join('\n')
  res.setHeader('Content-Type','application/pdf')
  res.setHeader('Content-Disposition','attachment; filename="rapport-visibilite.pdf"')
  // Not a real PDF, but a text placeholder for demo to avoid serverless headless chromium.
  res.send(Buffer.from(content, 'utf-8'))
}
