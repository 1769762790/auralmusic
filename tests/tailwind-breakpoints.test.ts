import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

import { compile } from 'tailwindcss'

const STYLESHEET_IMPORTS: Record<string, string> = {
  tailwindcss: 'node_modules/tailwindcss/index.css',
  'tw-animate-css': 'node_modules/tw-animate-css/dist/tw-animate.css',
  'shadcn/tailwind.css': 'node_modules/shadcn/dist/tailwind.css',
  '@fontsource-variable/geist':
    'node_modules/@fontsource-variable/geist/index.css',
  '@fontsource-variable/inter':
    'node_modules/@fontsource-variable/inter/index.css',
}

async function loadStylesheet(id: string, base: string) {
  const mappedPath = STYLESHEET_IMPORTS[id]
  const resolvedPath = mappedPath
    ? path.resolve(mappedPath)
    : path.resolve(base || '.', id)

  return {
    path: resolvedPath,
    base: path.dirname(resolvedPath),
    content: await fs.readFile(resolvedPath, 'utf8'),
  }
}

test('globals.css compiles 3xl and 4xl breakpoints as rem-based media queries', async () => {
  const globalsPath = path.resolve('src/renderer/styles/globals.css')
  const input = await fs.readFile(globalsPath, 'utf8')
  const compiler = await compile(input, {
    from: globalsPath,
    base: process.cwd(),
    loadStylesheet,
  })

  const output = compiler.build([
    'grid',
    'grid-cols-2',
    '2xl:grid-cols-5',
    '3xl:grid-cols-6',
    '4xl:grid-cols-7',
  ])

  assert.match(output, /@media \(width >= 96rem\)/)
  assert.match(output, /@media \(width >= 112\.5rem\)/)
  assert.match(output, /@media \(width >= 137\.5rem\)/)
})
