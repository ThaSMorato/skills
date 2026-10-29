import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The review ends in a question, and the question decides what ships: a fix that quietly changes a
// contract, a value nobody sourced, a finding closed with no record of what happened to it. And the
// review has to be able to read work that is not committed yet, without committing it, and without
// reading anyone else's changes along with it.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const REVIEW = 'commands/tm-review.md'

test('a fix that changes what others observe is asked on its own, before any code', () => {
  assert.match(read(REVIEW), /changes what a caller or the user observes[^\n]*its own question, before any code/)
})

test('the fix question follows the sources: no recommendation without one, the project rule recommended', () => {
  const review = read(REVIEW)

  assert.deepEqual(
    {
      unsourced: /no source gives[^\n]*without a recommendation/.test(review),
      writtenRule: /cites a rule the project wrote[^\n]*recommends complying/.test(review),
      approved: review.includes('deliver as approved, with a follow-up'),
      preExisting: review.includes('fix in this ticket'),
    },
    { unsourced: true, writtenRule: true, approved: true, preExisting: true },
  )
})

test('every finding leaves the fix phase with its outcome', () => {
  const review = read(REVIEW)

  assert.deepEqual(
    { phase: /^### Fixing what was chosen$/m.test(review), outcome: review.includes('- **Outcome:** fixed'), browser: /UI or CSS[^\n]*browser/.test(review) },
    { phase: true, outcome: true, browser: true },
  )
})

test('uncommitted work is reviewed from its manifest, and never committed to pass the preflight', () => {
  const review = read(REVIEW)

  assert.deepEqual(
    {
      flag: review.includes('--worktree <manifest>'),
      neverCommits: /\*\*Never commit to satisfy this preflight\*\*/.test(review),
      othersLeftOut: /outside the manifest[^\n]*out of the findings/.test(review),
      mode: /^mode: committed \| worktree$/m.test(review),
      manifest: read('skills/implement/SKILL.md').includes('manifest.txt'),
    },
    { flag: true, neverCommits: true, othersLeftOut: true, mode: true, manifest: true },
  )
})

test('a visual criterion is checked in the browser at its seam, and a missing browser blocks it', () => {
  assert.deepEqual(
    {
      plan: /computed style/.test(read('skills/ticket-plan/PLAN-FORMAT.md')),
      design: /cascade/.test(read('skills/ticket-design/SKILL.md')),
      implement: /no browser tool[^\n]*blocked/.test(read('skills/implement/SKILL.md')),
    },
    { plan: true, design: true, implement: true },
  )
})
