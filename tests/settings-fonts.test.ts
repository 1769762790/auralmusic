import assert from 'node:assert/strict'
import test from 'node:test'

import {
  mergeFontFamilies,
  querySystemFontFamilies,
} from '../src/renderer/pages/Settings/settings-fonts.ts'

type WindowWithSystemFonts = typeof globalThis & {
  window?: {
    electronSystemFonts?: {
      getAll: () => Promise<string[]>
    }
  }
}

test('querySystemFontFamilies reads fonts from preload api and normalizes duplicates', async () => {
  const runtime = globalThis as WindowWithSystemFonts
  const previousWindow = runtime.window

  runtime.window = {
    electronSystemFonts: {
      getAll: async () => ['  Inter  ', 'Noto Sans SC', 'Inter'],
    },
  }

  try {
    const result = await querySystemFontFamilies()

    assert.deepEqual(result, {
      fonts: ['Inter', 'Noto Sans SC'],
      status: 'ok',
      message: undefined,
    })
  } finally {
    runtime.window = previousWindow
  }
})

test('querySystemFontFamilies reports unsupported when preload api is missing', async () => {
  const runtime = globalThis as WindowWithSystemFonts
  const previousWindow = runtime.window

  runtime.window = {}

  try {
    const result = await querySystemFontFamilies()

    assert.equal(result.status, 'unsupported')
    assert.deepEqual(result.fonts, [])
  } finally {
    runtime.window = previousWindow
  }
})

test('mergeFontFamilies keeps built-in fonts, current value, and deduplicated system fonts', () => {
  assert.deepEqual(mergeFontFamilies(['Inter', 'Noto Sans SC'], 'Maple Mono'), [
    'Inter Variable',
    'Geist Variable',
    'system-ui',
    'Maple Mono',
    'Inter',
    'Noto Sans SC',
  ])
})
