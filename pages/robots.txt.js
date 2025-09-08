export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`User-agent: *
Allow: /

# Bloque le privé / bruit
Disallow: /dashboard
Disallow: /api/
Disallow: /_next/

# Autorisations explicites pour les bots IA (quand ils respectent robots)
User-agent: GPTBot
Allow: /
User-agent: CCBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Applebot-Extended
Allow: /
Sitemap: https://tondomaine.fr/sitemap.xml
`)
}
