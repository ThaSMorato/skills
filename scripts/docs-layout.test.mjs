import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The docs describe the system, one living folder per feature, and a task leaves only a difference in
// them; what belongs to the effort (the brief, the cut into epics) is temporary and lives in
// `.scratch/<effort>/`. A stage that still cites an old path writes or reads a document the new layout
// does not have. Only the migration command names the old paths, because finding them is its job.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const MIGRATION = 'commands/tm-docs-migrate.md'

const OLD_PATHS = [
  'docs/requirements-brief.md', 'docs/prd.md', 'docs/design-system.md', 'docs/hld.md', 'docs/components.md',
  'docs/boundaries.md', 'docs/features.md', 'docs/fdd/', 'docs/diagrams/', 'docs/c4/', 'docs/ui/',
]

function markdownFiles(dir) {
  return readdirSync(join(root, dir), { recursive: true })
    .filter((path) => path.endsWith('.md'))
    .map((path) => join(dir, path))
}

const sources = [
  ...markdownFiles('commands'), ...markdownFiles('skills'), ...markdownFiles('agents'), ...markdownFiles('templates'),
  ...markdownFiles('docs'), ...markdownFiles('adapters'), 'README.md',
].filter((path) => path !== MIGRATION)

test('no stage cites a path of the old docs layout', () => {
  const stale = sources.flatMap((path) => OLD_PATHS.filter((old) => read(path).includes(old)).map((old) => `${path}: ${old}`))

  assert.deepEqual(stale, [])
})

test('the migration knows every old path', () => {
  const text = existsSync(join(root, MIGRATION)) ? read(MIGRATION) : ''

  assert.deepEqual(OLD_PATHS.filter((old) => !text.includes(old)), [])
})

// The decomposition was one file holding two lifetimes: which features the system has (living) and
// how this effort cuts and orders them (temporary). Each now has its own template.
test('the feature index and the effort decomposition have their own templates', () => {
  const templates = readdirSync(join(root, 'templates'))

  assert.deepEqual(
    { index: templates.includes('features-index.md'), decomposition: templates.includes('decomposition.md'), old: templates.includes('features.md') },
    { index: true, decomposition: true, old: false },
  )
})
