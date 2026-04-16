import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createMusicSourceSettingsDraft,
  createMusicSourceSettingsSaveEntries,
} from '../src/renderer/pages/Settings/components/music-source-settings.model.ts'

test('createMusicSourceSettingsDraft exposes legacy provider presence for UI hints', () => {
  const draft = createMusicSourceSettingsDraft({
    musicSourceProviders: ['migu', 'lxMusic'],
    enhancedSourceModules: ['unm', 'bikonoo'],
    luoxueSourceEnabled: true,
    customMusicApiEnabled: false,
    customMusicApiUrl: '',
  })

  assert.deepEqual(draft, {
    hasLegacyProviders: true,
    enhancedSourceModules: ['unm', 'bikonoo'],
    luoxueSourceEnabled: true,
    customMusicApiEnabled: false,
    customMusicApiUrl: '',
  })
})

test('createMusicSourceSettingsSaveEntries clears deprecated provider selections', () => {
  const entries = createMusicSourceSettingsSaveEntries({
    enhancedSourceModules: ['bikonoo', 'gdmusic'],
    luoxueSourceEnabled: true,
    customMusicApiEnabled: true,
    customMusicApiUrl: '  https://api.example.com  ',
  })

  assert.deepEqual(entries, [
    ['musicSourceProviders', []],
    ['enhancedSourceModules', ['bikonoo', 'gdmusic']],
    ['luoxueSourceEnabled', true],
    ['customMusicApiEnabled', true],
    ['customMusicApiUrl', 'https://api.example.com'],
  ])
})
