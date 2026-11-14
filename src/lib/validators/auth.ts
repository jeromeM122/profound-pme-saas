import { z } from 'zod'

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ message: 'Adresse e-mail invalide' }))

const RESERVED_HANDLES = new Set([
  'admin', 'administrateur', 'moderateur', 'moderation', 'support', 'tresser', 'api', 'go', 'compte',
  'connexion', 'produits', 'panier', 'feed', 'jumelles', 'diagnostic', 'help', 'aide', 'root', 'system',
])

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_.]{3,30}$/, '3 à 30 caractères : lettres, chiffres, « _ » ou « . »')
  .refine((h) => !h.startsWith('.') && !h.endsWith('.') && !h.includes('..'), 'Format de pseudo invalide')
  .refine((h) => !RESERVED_HANDLES.has(h), 'Ce pseudo est réservé')

/** Only allow same-site relative redirects after login (prevents open redirects). */
export const callbackUrlSchema = z
  .string()
  .max(512)
  .refine((u) => u.startsWith('/') && !u.startsWith('//') && !u.startsWith('/\\'), 'Invalid callback')
  .catch('/compte')

export const magicLinkFormSchema = z.object({
  email: emailSchema,
  callbackUrl: callbackUrlSchema.optional().default('/compte'),
})

/** Strips control characters (keeps line breaks for bios) — text is always rendered escaped anyway. */
const clean = (s: string, keepNewlines = false) =>
  s.replace(keepNewlines ? /[\u0000-\u0009\u000B-\u001F\u007F‪-‮⁦-⁩]/g : /[\u0000-\u001F\u007F‪-‮⁦-⁩]/g, '')

export const profileFormSchema = z.object({
  handle: handleSchema,
  name: z.string().transform((s) => clean(s).trim()).pipe(z.string().max(60, '60 caractères maximum')),
  bio: z
    .string()
    .transform((s) => clean(s, true).replace(/\n{3,}/g, '\n\n').trim())
    .pipe(z.string().max(280, '280 caractères maximum')),
  isPublic: z.boolean(),
  badgePublic: z.boolean(),
})
export type ProfileForm = z.infer<typeof profileFormSchema>
