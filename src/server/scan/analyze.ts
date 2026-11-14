import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import sharp from 'sharp'
import { z } from 'zod'
import { HairGoal, HairTexture } from '@/generated/prisma/enums'
import { PHOTO_MAX_BYTES } from '@/server/media/keys'
import { appUrl } from '@/server/security/app-origin'
import { isLocalhostUrl } from '@/server/security/localhost'

/**
 * Hair photo scan (Claude vision). The photo is re-encoded in memory (metadata stripped,
 * ≤ 1024 px) and sent once for analysis; tresser never stores it.
 */
const ScanSchema = z.object({
  hairVisible: z.boolean().describe('false if no hair is clearly visible or the photo is unusable'),
  texture: z.enum(HairTexture).nullable().describe('Estimated curl pattern, null if hairVisible is false'),
  confidence: z.enum(['low', 'medium', 'high']),
  pattern: z.string().describe('One short French sentence describing the visible curl pattern'),
  observations: z.array(z.string()).describe('Up to 4 short French observations about the hair only (frizz, definition, shine, apparent dryness, shrinkage, density, length)'),
  likelyNeeds: z.array(z.enum(HairGoal)).describe('Up to 3 care goals suggested by what is visible'),
  photoTip: z.string().nullable().describe('If the photo is hard to read, one short French tip to retake it; else null'),
})
export type ScanResult = z.infer<typeof ScanSchema>

const SYSTEM = `Tu es l'outil de scan capillaire de tresser.fr. On te montre une photo de cheveux.
Ta tâche : estimer le type de boucle selon le système 1A–4C (1 raides, 2 ondulés, 3 bouclés, 4 frisés/crépus ; A/B/C du plus lâche au plus serré) et décrire ce qui est visible sur les cheveux.

Règles strictes :
- Parle uniquement des cheveux. Ne déduis ni ne mentionne jamais l'origine, l'ethnie, l'âge, le genre, l'identité ou l'apparence de la personne, et ne commente pas le visage.
- N'estime pas la porosité : elle ne se voit pas sur une photo.
- Pas de diagnostic médical (chute, maladie du cuir chevelu) : reste sur des observations cosmétiques.
- Si la photo ne montre pas clairement des cheveux, ou si le type est impossible à lire (cheveux attachés serrés, perruque, flou, sombre), mets hairVisible à false ou confidence à "low" et donne un conseil dans photoTip.
- Les cheveux mouillés ou tirés paraissent plus lâches qu'ils ne sont ; tiens-en compte dans la confiance.
- Réponds en français, phrases courtes et bienveillantes.`

export function scanAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY) || fakeMode()
}
/** Simulated analysis for local tests only (never on a real domain). */
const fakeMode = () => process.env.SCAN_FAKE === '1' && (process.env.NODE_ENV !== 'production' || isLocalhostUrl(appUrl()))

export type ScanOutcome = { ok: true; result: ScanResult } | { ok: false; error: string }

export async function analyzeHairPhoto(input: Buffer): Promise<ScanOutcome> {
  if (input.length === 0 || input.length > PHOTO_MAX_BYTES) return { ok: false, error: 'Photo trop lourde (4 Mo max).' }
  let jpeg: Buffer
  try {
    jpeg = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()
  } catch {
    return { ok: false, error: 'Cette image n’a pas pu être lue.' }
  }

  if (fakeMode()) {
    return { ok: true, result: { hairVisible: true, texture: 'T4B', confidence: 'medium', pattern: 'Des boucles très serrées en zigzag, avec une forte rétractation.', observations: ['Volume important', 'Pointes un peu sèches', 'Peu de définition'], likelyNeeds: ['HYDRATION', 'DEFINITION'], photoTip: null } }
  }
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, error: 'Le scan n’est pas encore disponible.' }

  const client = new Anthropic()
  try {
    const response = await client.beta.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(ScanSchema) },
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: jpeg.toString('base64') } },
            { type: 'text', text: 'Analyse les cheveux sur cette photo.' },
          ],
        },
      ],
    })
    if (response.stop_reason === 'refusal' || !response.parsed_output) return { ok: false, error: 'Cette photo n’a pas pu être analysée. Essaie une autre photo, centrée sur les cheveux.' }
    const r = response.parsed_output
    return {
      ok: true,
      result: { ...r, texture: r.hairVisible ? r.texture : null, observations: r.observations.slice(0, 4), likelyNeeds: [...new Set(r.likelyNeeds)].slice(0, 3) },
    }
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return { ok: false, error: 'Beaucoup de scans en ce moment, réessaie dans une minute.' }
    if (err instanceof Anthropic.APIError) {
      console.error('[scan] API error', err.status, err.message)
      return { ok: false, error: 'Le scan est momentanément indisponible.' }
    }
    throw err
  }
}
