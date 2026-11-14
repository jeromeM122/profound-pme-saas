import 'server-only'
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth'
import type { Adapter, AdapterAccount } from 'next-auth/adapters'
import Apple from 'next-auth/providers/apple'
import Google from 'next-auth/providers/google'
import Nodemailer from 'next-auth/providers/nodemailer'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Role } from '@/generated/prisma/enums'
import { db } from '@/server/db'
import { env } from '@/server/env'
import { sendMagicLink } from '@/server/email/magic-link'

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: Role; handle: string | null } & DefaultSession['user']
  }
  interface User {
    role?: Role
    handle?: string | null
    deletedAt?: Date | null
  }
}

const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days, sliding
const SESSION_UPDATE_AGE = 24 * 60 * 60

/**
 * Adapter hardening:
 *  - OAuth access/refresh/id tokens are never persisted: we only use OAuth for identity (least privilege).
 *  - Emails are normalised to lowercase (also enforced by a DB CHECK constraint).
 */
function hardenedAdapter(): Adapter {
  // PrismaAdapter is typed against @prisma/client; our client is generated to src/generated (same runtime API).
  const base = PrismaAdapter(db as unknown as Parameters<typeof PrismaAdapter>[0])
  return {
    ...base,
    createUser: (user) => base.createUser!({ ...user, email: user.email.toLowerCase() }),
    getUserByEmail: (email) => base.getUserByEmail!(email.toLowerCase()),
    linkAccount: (account) => {
      const minimal: AdapterAccount = {
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        scope: account.scope,
        token_type: account.token_type,
      }
      return base.linkAccount!(minimal)
    },
  }
}

function buildConfig(): NextAuthConfig {
  const e = env()
  const secure = e.APP_URL.startsWith('https://')

  const providers: NextAuthConfig['providers'] = []
  if (e.EMAIL_SERVER && e.EMAIL_FROM) {
    providers.push(
      Nodemailer({
        server: e.EMAIL_SERVER,
        from: e.EMAIL_FROM,
        maxAge: 15 * 60, // magic links expire after 15 minutes
        sendVerificationRequest: sendMagicLink,
      }),
    )
  }
  if (e.AUTH_GOOGLE_ID && e.AUTH_GOOGLE_SECRET) {
    // Linking to an existing email account is safe only because we require Google's email_verified (signIn callback).
    providers.push(Google({ clientId: e.AUTH_GOOGLE_ID, clientSecret: e.AUTH_GOOGLE_SECRET, allowDangerousEmailAccountLinking: true }))
  }
  if (e.AUTH_APPLE_ID && e.AUTH_APPLE_SECRET) {
    // Apple only returns verified addresses (incl. private relay).
    providers.push(Apple({ clientId: e.AUTH_APPLE_ID, clientSecret: e.AUTH_APPLE_SECRET, allowDangerousEmailAccountLinking: true }))
  }

  // Apple Sign-In posts the callback cross-site (form_post), so its short-lived, signed state/PKCE/nonce
  // cookies must be SameSite=None. The session cookie itself stays SameSite=Lax (+ Origin check in proxy).
  const crossSiteOAuthCookie = { httpOnly: true, sameSite: 'none' as const, path: '/', secure: true }

  return {
    adapter: hardenedAdapter(),
    secret: e.AUTH_SECRET,
    trustHost: true,
    providers,
    session: { strategy: 'database', maxAge: SESSION_MAX_AGE, updateAge: SESSION_UPDATE_AGE },
    useSecureCookies: secure,
    cookies: {
      sessionToken: {
        // __Host- prefix: Secure, Path=/, no Domain → cannot be set or overwritten by a subdomain.
        name: secure ? '__Host-tresser.sid' : 'tresser.sid',
        options: { httpOnly: true, sameSite: 'lax', path: '/', secure },
      },
      ...(secure
        ? {
            state: { name: '__Secure-tresser.state', options: { ...crossSiteOAuthCookie, maxAge: 900 } },
            pkceCodeVerifier: { name: '__Secure-tresser.pkce', options: { ...crossSiteOAuthCookie, maxAge: 900 } },
            nonce: { name: '__Secure-tresser.nonce', options: crossSiteOAuthCookie },
          }
        : {}),
    },
    pages: { signIn: '/connexion', verifyRequest: '/connexion/verification', error: '/connexion' },
    callbacks: {
      signIn({ user, account, profile }) {
        if (user.deletedAt) return false
        if (account?.provider === 'google' && profile?.email_verified !== true) return false
        return true
      },
      session({ session, user }) {
        session.user.id = user.id
        session.user.role = user.role ?? 'USER'
        session.user.handle = user.handle ?? null
        return session
      },
      redirect({ url, baseUrl }) {
        // Only same-origin redirects after sign-in / sign-out.
        if (url.startsWith('/') && !url.startsWith('//')) return `${baseUrl}${url}`
        try {
          if (new URL(url).origin === baseUrl) return url
        } catch {
          /* fall through */
        }
        return baseUrl
      },
    },
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => buildConfig())

/** Which sign-in methods are configured (for the login UI). */
export function enabledProviders() {
  const e = env()
  return {
    email: Boolean(e.EMAIL_SERVER && e.EMAIL_FROM),
    google: Boolean(e.AUTH_GOOGLE_ID && e.AUTH_GOOGLE_SECRET),
    apple: Boolean(e.AUTH_APPLE_ID && e.AUTH_APPLE_SECRET),
  }
}
