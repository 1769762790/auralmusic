import assert from 'node:assert/strict'
import test from 'node:test'

import {
  defaultConfig,
  normalizeDownloadQualityPolicy,
} from '../src/main/config/types.ts'

test('normalizeDownloadQualityPolicy keeps supported values and falls back to the default', () => {
  assert.equal(defaultConfig.downloadQualityPolicy, 'fallback')
  assert.equal(normalizeDownloadQualityPolicy('strict'), 'strict')
  assert.equal(normalizeDownloadQualityPolicy('fallback'), 'fallback')
  assert.equal(normalizeDownloadQualityPolicy('unexpected'), 'fallback')
  assert.equal(normalizeDownloadQualityPolicy(undefined), 'fallback')
})
