import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/go/', '/api/', '/compte', '/admin', '/connexion', '/diagnostic/resultat', '/jumelles'] }],
  }
}
