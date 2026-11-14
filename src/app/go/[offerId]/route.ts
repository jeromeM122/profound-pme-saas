import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/server/auth'
import { buildDestination, isBot, OFFER_ID_RE, safeSourcePath } from '@/server/catalog/click'
import { db } from '@/server/db'
import { env } from '@/server/env'
import { hashIp } from '@/server/security/crypto'
import { clientIp } from '@/server/security/ratelimit'

/**
 * Tracked outbound redirect: logs the click (pseudonymous), then 302 to the merchant.
 * Rate-limited by the proxy (policy "affiliateRedirect"). The destination comes only from the
 * database and must match the merchant's allowed hosts — never from the request.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params
  const from = safeSourcePath(req.nextUrl.searchParams.get('from'))
  const back = () => NextResponse.redirect(new URL(from, req.nextUrl.origin), 302)
  if (!OFFER_ID_RE.test(offerId)) return back()

  const offer = await db.affiliateOffer.findUnique({
    where: { id: offerId },
    select: { id: true, active: true, targetUrl: true, product: { select: { slug: true, status: true } }, merchant: { select: { allowedHosts: true, subIdParam: true, active: true } } },
  })
  if (!offer || !offer.active || !offer.merchant.active || offer.product.status !== 'ACTIVE') return back()

  const clickId = crypto.randomUUID().replace(/-/g, '') // also used as SubID for affiliate networks
  const campaign = from.split('/').filter(Boolean).pop() ?? offer.product.slug
  const destination = buildDestination(offer.targetUrl, offer.merchant.allowedHosts, { campaign, clickId, subIdParam: offer.merchant.subIdParam })
  if (!destination) return back()

  const session = await auth()
  try {
    await db.clickEvent.create({
      data: {
        id: clickId,
        offerId: offer.id,
        userId: session?.user?.id ?? null,
        sourcePath: from,
        ipHash: hashIp(clientIp(req.headers), env().APP_HMAC_SECRET),
        uaBot: isBot(req.headers.get('user-agent')),
      },
    })
  } catch (err) {
    // Never block the shopper because analytics failed.
    console.error('[go] click log failed', err instanceof Error ? err.message : err)
  }

  const res = NextResponse.redirect(destination, 302)
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return res
}
