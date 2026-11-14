import { describe, expect, it } from 'vitest'
import { callbackUrlSchema, emailSchema, handleSchema } from '@/lib/validators/auth'
import { hasRole } from '@/server/rbac'

describe('validators', () => {
  it('normalises emails and rejects garbage', () => {
    expect(emailSchema.parse('  Awa@Exemple.FR ')).toBe('awa@exemple.fr')
    for (const bad of ['', 'a@', 'a@b,c@d.fr', `${'a'.repeat(250)}@x.fr`]) expect(emailSchema.safeParse(bad).success).toBe(false)
  })

  it('validates handles', () => {
    expect(handleSchema.parse('Curly.Queen_4c')).toBe('curly.queen_4c')
    for (const bad of ['ab', 'admin', '.awa', 'awa..b', 'awa<script>', 'a'.repeat(31)])
      expect(handleSchema.safeParse(bad).success).toBe(false)
  })

  it('only keeps same-site relative callback URLs (no open redirect)', () => {
    expect(callbackUrlSchema.parse('/produits?x=1')).toBe('/produits?x=1')
    for (const bad of ['https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)'])
      expect(callbackUrlSchema.parse(bad)).toBe('/compte')
  })
})

describe('RBAC', () => {
  it('enforces the role hierarchy', () => {
    expect(hasRole('ADMIN', 'MODERATOR')).toBe(true)
    expect(hasRole('MODERATOR', 'MODERATOR')).toBe(true)
    expect(hasRole('CREATOR', 'MODERATOR')).toBe(false)
    expect(hasRole(undefined, 'USER')).toBe(false)
  })
})
