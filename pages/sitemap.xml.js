const PAGES = [
  '/', '/pricing', '/faq', '/legal', '/privacy'
]

export default function handler(req, res) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://tondomaine.fr'
  const urls = PAGES.map(p => `<url><loc>${base}${p}</loc><changefreq>weekly</changefreq><priority>${p==='/'?'1.0':'0.8'}</priority></url>`).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  res.setHeader('Content-Type', 'application/xml')
  res.send(xml)
}
