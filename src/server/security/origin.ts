/**
 * CSRF defence for state-changing requests: the Origin (or, failing that, Referer) must match our own origin.
 * Combined with SameSite=Lax session cookies, this blocks cross-site form/fetch forgery.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/** Endpoints legitimately hit cross-site (they carry their own verification). */
const CROSS_SITE_ALLOWED = [
  /^\/api\/auth\/callback\/apple$/, // Apple Sign-In uses response_mode=form_post (state + PKCE checked by Auth.js)
  /^\/api\/webhooks\//, // signature-verified (Stripe, affiliate networks)
]

export function isStateChanging(method: string): boolean {
  return !SAFE_METHODS.has(method.toUpperCase())
}

export function isCrossSiteAllowed(pathname: string): boolean {
  return CROSS_SITE_ALLOWED.some((re) => re.test(pathname))
}

export function isSameOrigin(headers: Headers, expectedOrigin: string): boolean {
  const origin = headers.get('origin')
  if (origin) return origin === expectedOrigin
  const referer = headers.get('referer')
  if (!referer) return false
  try {
    return new URL(referer).origin === expectedOrigin
  } catch {
    return false
  }
}
