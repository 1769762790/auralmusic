import test from 'node:test'
import assert from 'node:assert/strict'

import {
  clearThemeColorOverrides,
  deriveThemeColorTokens,
  normalizeThemeColor,
} from '../src/renderer/theme/theme-color.ts'

test('normalizeThemeColor canonicalizes valid hex values and rejects invalid input', () => {
  assert.equal(normalizeThemeColor('#7c3aed'), '#7C3AED')
  assert.equal(normalizeThemeColor('7c3aed'), '#7C3AED')
  assert.equal(normalizeThemeColor('#7C3AED'), '#7C3AED')
  assert.equal(normalizeThemeColor('#zzz999'), null)
  assert.equal(normalizeThemeColor(''), null)
  assert.equal(normalizeThemeColor(null), null)
})

test('deriveThemeColorTokens returns linked primary accent and sidebar variables', () => {
  const tokens = deriveThemeColorTokens('#7C3AED')

  assert.equal(tokens['--primary'], '#7C3AED')
  assert.equal(typeof tokens['--primary-foreground'], 'string')
  assert.equal(typeof tokens['--accent'], 'string')
  assert.equal(typeof tokens['--accent-foreground'], 'string')
  assert.equal(typeof tokens['--ring'], 'string')
  assert.equal(tokens['--sidebar-primary'], '#7C3AED')
  assert.equal(typeof tokens['--sidebar-primary-foreground'], 'string')
  assert.equal(typeof tokens['--sidebar-accent'], 'string')
  assert.equal(typeof tokens['--sidebar-accent-foreground'], 'string')
})

test('clearThemeColorOverrides removes all linked theme color properties from the root style', () => {
  const style = {
    removed: [] as string[],
    removeProperty(name: string) {
      this.removed.push(name)
    },
  }

  clearThemeColorOverrides(style)

  assert.deepEqual(style.removed, [
    '--primary',
    '--primary-foreground',
    '--ring',
    '--accent',
    '--accent-foreground',
    '--sidebar-primary',
    '--sidebar-primary-foreground',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
  ])
})
