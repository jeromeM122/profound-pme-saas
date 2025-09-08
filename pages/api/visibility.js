export default async function handler(req, res){
  const { website = '', keywords = '' } = req.query
  // TODO: Replace mock with real calls to LLM/answer engines.
  // For demo: compute a pseudo score from string lengths.
  const base = (website.length + keywords.length) % 100
  const score = Math.max(0.12, Math.min(0.88, (base/100)))
  const competitors = [
    { name: 'Concurrent A', score: Math.max(0.05, score + 0.1 - 0.2*Math.random()) },
    { name: 'Concurrent B', score: Math.max(0.05, score + 0.15 - 0.2*Math.random()) },
    { name: 'Concurrent C', score: Math.max(0.05, score + 0.05 - 0.2*Math.random()) },
  ]
  res.status(200).json({ score, competitors })
}
