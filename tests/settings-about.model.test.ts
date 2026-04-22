import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ABOUT_UPDATE_FAILED_MESSAGE,
  ABOUT_UP_TO_DATE_MESSAGE,
  ABOUT_USAGE_NOTICE_LINES,
  createAboutUpdatePreviewSnapshot,
  resolveAboutVersionLabel,
} from '../src/renderer/pages/Settings/components/about-settings.model.ts'

test('resolveAboutVersionLabel formats app version safely', () => {
  assert.equal(resolveAboutVersionLabel('1.2.3'), 'v1.2.3')
  assert.equal(resolveAboutVersionLabel('  2.0.0-beta.1  '), 'v2.0.0-beta.1')
  assert.equal(resolveAboutVersionLabel(''), '版本未知')
})

test('about update message explains the current update state', () => {
  assert.equal(ABOUT_UP_TO_DATE_MESSAGE, '当前已是最新版')
  assert.equal(ABOUT_UPDATE_FAILED_MESSAGE, '检查更新失败，请稍后重试')
})

test('about usage notice keeps the required project disclaimer', () => {
  assert.deepEqual(ABOUT_USAGE_NOTICE_LINES, [
    '本项目仅供个人技术学习，禁止任何侵权、非法二次分发与商用。',
    '任何使用者利用本工具实施的侵权行为，均与本项目开发者无关。',
    '如存在版权争议，请联系相关音源平台下架处理。',
    '请务必通过官方正版渠道购买会员、合法收听，共同维护良好音乐版权环境。',
  ])
})

test('createAboutUpdatePreviewSnapshot builds an update-available preview with html release notes', () => {
  const snapshot = createAboutUpdatePreviewSnapshot({
    currentVersion: '1.2.0',
    platform: 'win32',
  })

  assert.equal(snapshot.status, 'update-available')
  assert.equal(snapshot.currentVersion, '1.2.0')
  assert.equal(snapshot.latestVersion, '1.2.1')
  assert.equal(snapshot.actionMode, 'install')
  assert.match(snapshot.releaseNotes, /<ol>/)
  assert.match(snapshot.releaseNotes, /<li>优化渲染性能<\/li>/)
  assert.match(snapshot.releaseNotes, /<code>MV<\/code>/)
})

test('createAboutUpdatePreviewSnapshot respects linux external-link mode', () => {
  const snapshot = createAboutUpdatePreviewSnapshot({
    currentVersion: '1.2.0',
    platform: 'linux',
  })

  assert.equal(snapshot.actionMode, 'external-link')
})
