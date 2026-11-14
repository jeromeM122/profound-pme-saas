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
