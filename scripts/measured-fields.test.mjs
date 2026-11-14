import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// /retro sums fields and never reads a count out of prose: a field nobody writes is a "not measured"
// cell in every retro. The flow report found the progress file without the failed deliverables, two
// values for "finished", and tickets whose type, gear and criteria live only in the body.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const progressFrontmatter = read('skills/implement/SKILL.md').match(/```markdown\n---\nkind: progress\n([\s\S]*?)\n---\n/)?.[1] ?? ''
const ticketFrontmatter = read('templates/ticket.md').match(/-->\n\n---\n([\s\S]*?)\n---\n/)?.[1] ?? ''

test('the progress file records what the retro sums', () => {
  const missing = ['status', 'sis_done', 'sis_total', 'escalations', 'unverified', 'failed_deliverables']
    .filter((field) => !new RegExp(`^${field}: `, 'm').test(progressFrontmatter))

  assert.deepEqual(missing, [])
})

test('the progress file has a single value for finished', () => {
  assert.match(progressFrontmatter, /^status: in_progress \| completed$/m)
})

test('the ticket carries its kind, type, gear and criteria in frontmatter', () => {
  const missing = ['kind: ticket', 'type: ', 'gear: ', 'acs: '].filter((field) => !ticketFrontmatter.includes(field))

  assert.deepEqual(missing, [])
})
