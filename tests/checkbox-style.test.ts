import test from 'node:test'
import assert from 'node:assert/strict'

import { checkboxBaseClassName } from '../src/renderer/components/ui/checkbox.styles.ts'

test('checkbox base style keeps unchecked state visible on light backgrounds', () => {
  assert.match(checkboxBaseClassName, /\bborder-border\b/)
  assert.match(checkboxBaseClassName, /\bbg-background\b/)
  assert.match(checkboxBaseClassName, /\bshadow-xs\b/)
  assert.match(checkboxBaseClassName, /hover:border-primary\/40/)
})
