import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Stages point at plugin files by `${CLAUDE_PLUGIN_ROOT}/<path>`. A path that does not exist fails only
// when the stage runs, and a template missing from templates/README.md is one nobody knows to fill.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGIN_PATH = /\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9_./-]+\.[a-z]+)/g

function markdownFiles(dir) {
  return readdirSync(join(root, dir), { recursive: true })
    .filter((path) => path.endsWith('.md'))
    .map((path) => join(dir, path))
}

const sources = ['skills', 'agents', 'commands', 'templates', 'docs'].flatMap(markdownFiles)

test('every ${CLAUDE_PLUGIN_ROOT} path a stage cites exists', () => {
  const missing = sources.flatMap((path) =>
    [...readFileSync(join(root, path), 'utf8').matchAll(PLUGIN_PATH)]
      .map(([, cited]) => cited.replace(/[.,;:)]+$/, ''))
      .filter((cited) => !existsSync(join(root, cited)))
      .map((cited) => `${path}: ${cited}`),
  )

  assert.deepEqual(missing, [])
})

test('every template is listed in templates/README.md', () => {
  const index = readFileSync(join(root, 'templates', 'README.md'), 'utf8')
  const unlisted = readdirSync(join(root, 'templates'))
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .filter((file) => !index.includes(`\`${file}\``))

  assert.deepEqual(unlisted, [])
})
