#!/usr/bin/env node
const { spawn } = require('node:child_process')
const path = require('node:path')

const mode = process.argv[2]

if (!mode) {
  console.error('Missing electron-vite mode argument.')
  process.exit(1)
}

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const electronVitePackageJson = require.resolve('electron-vite/package.json')
const electronViteCli = path.join(
  path.dirname(electronVitePackageJson),
  'bin',
  'electron-vite.js'
)
const child = spawn(process.execPath, [electronViteCli, mode, ...process.argv.slice(3)], {
  stdio: 'inherit',
  env,
  shell: false,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})

child.on('error', error => {
  console.error(error)
  process.exit(1)
})
