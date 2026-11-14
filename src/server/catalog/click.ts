/** Pure helpers for the /go redirect (unit-tested). */

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegrambot|discordbot|headless|lighthouse|pingdom|monitor/i
export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT_RE.test(userAgent)
}

/** Only internal routine / product pages are accepted as click sources. */
export function safeSourcePath(from: string | null): string {
  if (from && /^\/(routines|produits)(\/[a-z0-9-]{1,80})?$/.test(from)) return from
  return '/'
}

export const OFFER_ID_RE = /^off_[a-z0-9]{12}$/

/** Destination must be https and on one of the merchant's allowed hosts (anti open-redirect). */
export function buildDestination(
  targetUrl: string,
  allowedHosts: string[],
  opts: { campaign: string; clickId: string; subIdParam?: string | null },
): string | null {
  let u: URL
  try {
    u = new URL(targetUrl)
  } catch {
    return null
  }
  if (u.protocol !== 'https:' || u.username || u.password) return null
  if (!allowedHosts.map((h) => h.toLowerCase()).includes(u.hostname.toLowerCase())) return null
  if (!/(^|\.)instagram\.com$|(^|\.)tiktok\.com$/.test(u.hostname)) {
    u.searchParams.set('utm_source', 'tresser')
    u.searchParams.set('utm_medium', 'referral')
    u.searchParams.set('utm_campaign', opts.campaign)
    if (opts.subIdParam) u.searchParams.set(opts.subIdParam, opts.clickId)
  }
  return u.toString()
}
