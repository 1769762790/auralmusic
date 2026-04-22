import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>')

Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: window,
})

const { sanitizeUpdateReleaseNotesHtml } =
  await import('../src/renderer/components/update-modal.model.ts')

test('sanitizeUpdateReleaseNotesHtml preserves common release note markup', () => {
  const sanitized = sanitizeUpdateReleaseNotesHtml(`
    <ol>
      <li>优化渲染性能</li>
      <li><strong>重构</strong> <code>MV</code> 播放器</li>
      <li><a href="https://example.com/release">查看详情</a></li>
    </ol>
  `)

  assert.match(sanitized, /<ol>/)
  assert.match(sanitized, /<li>优化渲染性能<\/li>/)
  assert.match(sanitized, /<strong>重构<\/strong>/)
  assert.match(sanitized, /<code>MV<\/code>/)
  assert.match(sanitized, /href="https:\/\/example.com\/release"/)
})

test('sanitizeUpdateReleaseNotesHtml removes dangerous tags and attributes', () => {
  const sanitized = sanitizeUpdateReleaseNotesHtml(`
    <ul>
      <li onclick="alert('xss')">危险属性</li>
      <li><script>alert('xss')</script>脚本标签</li>
      <li><a href="javascript:alert('xss')">危险链接</a></li>
      <img src="x" onerror="alert('xss')" />
    </ul>
  `)

  assert.doesNotMatch(sanitized, /onclick=/)
  assert.doesNotMatch(sanitized, /<script/i)
  assert.doesNotMatch(sanitized, /javascript:/i)
  assert.doesNotMatch(sanitized, /<img/i)
  assert.match(sanitized, /危险属性/)
  assert.match(sanitized, /脚本标签/)
})
