
// Mock social mentions. Replace with real APIs (Meta/LinkedIn/Google My Business) where available.
export default async function handler(req, res){
  const { socials = '' } = req.query
  const now = new Date().toISOString()
  const mentions = [
    { source: 'Facebook', author: 'Client local', snippet: 'Super service, je recommande ! (5★) — ' + now },
    { source: 'Instagram', author: '@foodie971', snippet: 'Nouveau menu dispo, ça a l’air top 😍' },
    { source: 'Google', author: 'Mélissa', snippet: 'Très bonne expérience, merci à l’équipe.' }
  ]
  res.status(200).json({ mentions })
}
