import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// What a plan is built from decides what it gets wrong: the docs of a library version the repo does
// not use, an edge between features that says nothing about what crosses it, a request that changed
// after the tickets were cut, a bug planned before its cause is known, a finding the last ticket left
// open in the same file.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const LIBRARY_DOCS = 'skills/ticket-design/library-docs.md'

test('every stage that reads a library reads the installed version', () => {
  const readers = ['skills/ticket-design/SKILL.md', 'skills/ticket-plan/SKILL.md', 'agents/researcher.md', 'skills/generate-stack-guide/SKILL.md']

  assert.deepEqual(
    { rule: existsSync(join(root, LIBRARY_DOCS)), unaware: readers.filter((path) => !read(path).includes(LIBRARY_DOCS)) },
    { rule: true, unaware: [] },
  )
})

test('library references are kept per project and per version', () => {
  assert.deepEqual(
    { template: existsSync(join(root, 'templates/library-reference.md')), path: existsSync(join(root, LIBRARY_DOCS)) && read(LIBRARY_DOCS).includes('docs/research/libraries/<library>@<version>.md') },
    { template: true, path: true },
  )
})

test('research reads the decisions and the lockfile first', () => {
  const researcher = read('agents/researcher.md')

  assert.deepEqual({ adrs: researcher.includes('docs/adr/*.md'), lockfile: /lockfile/.test(researcher) }, { adrs: true, lockfile: true })
})

test('an edge between features says what crosses it', () => {
  assert.deepEqual(
    { decomposition: read('templates/decomposition.md').includes('consumes:'), validated: /consum/.test(read('skills/tickets-validate/SKILL.md')) },
    { decomposition: true, validated: true },
  )
})

test('the request trace remembers the version of the request it traced', () => {
  assert.deepEqual(
    { recorded: read('commands/tm-tickets.md').includes('source_sha256'), checked: read('commands/tm-flow.md').includes('source_sha256') },
    { recorded: true, checked: true },
  )
})

test('a bugfix is planned only from a diagnosis', () => {
  assert.match(read('skills/ticket-plan/SKILL.md'), /bugfix[^\n]*diagnoses\/[^\n]*\/tm-diagnose/)
})

test('a finding left open by an earlier ticket reaches the next one', () => {
  assert.deepEqual(
    { plan: read('skills/ticket-plan/SKILL.md').includes('reviews/'), review: /confirmed and not fixed/.test(read('commands/tm-review.md')) },
    { plan: true, review: true },
  )
})

test('the pattern scout brings the layout and the closest sibling rule', () => {
  const scout = read('agents/pattern-scout.md')

  assert.deepEqual({ layout: /\| Layout \|/.test(scout), sibling: /closest sibling rule/i.test(scout) }, { layout: true, sibling: true })
})
