<Seo />

import Head from 'next/head'
export default function Seo({ title="VisiIA — Visibilité IA pour PME/TPE", desc="Mesurez votre présence dans les réponses IA et scannez vos réseaux sociaux. Briefs prêts-à-poster.", url="https://tondomaine.fr" }){
  const org = {
    "@context":"https://schema.org",
    "@type":"Organization",
    "name":"VisiIA",
    "url": url,
    "logo": url + "/logo.png",
    "contactPoint": [{ "@type":"ContactPoint", "email":"support@tondomaine.fr", "contactType":"customer support", "areaServed":"FR" }]
  }
  const site = {
    "@context":"https://schema.org",
    "@type":"WebSite",
    "url": url,
    "name":"VisiIA",
    "potentialAction": {
      "@type":"SearchAction",
      "target": url + "/?q={search_term_string}",
      "query-input":"required name=search_term_string"
    }
  }
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={desc}/>
      <meta property="og:title" content={title}/>
      <meta property="og:description" content={desc}/>
      <meta property="og:url" content={url}/>
      <meta property="og:type" content="website"/>
      <link rel="canonical" href={url}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(org)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(site)}} />
    </Head>
  )
}
