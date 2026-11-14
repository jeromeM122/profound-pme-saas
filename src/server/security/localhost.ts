/** True only for loopback URLs — used to allow local prod-mode testing without weakening real deployments. */
export function isLocalhostUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)
  } catch {
    return false
  }
}
