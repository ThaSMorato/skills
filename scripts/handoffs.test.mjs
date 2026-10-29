import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// What breaks between stages is rarely a stage: it is the handoff. A validator that keeps going
// round after round, a next step named before the disk was read, a prerequisite that dropped out of
// the report, a pull request opened without the checks that only the moment before opening can make,
// and a question that offers more than was asked.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const ASKING = 'skills/asking/SKILL.md'
const PR = 'skills/pr/SKILL.md'
const BLOCKER_STATE = '${CLAUDE_PLUGIN_ROOT}/scripts/blocker-state.mjs'

test('the third dirty round hands the decision back to the owner', () => {
  const judges = ['skills/plan-validate/SKILL.md', 'skills/tickets-validate/SKILL.md', 'skills/doc-validate/SKILL.md', 'commands/tm-review.md']

  assert.deepEqual(judges.filter((path) => !/third `dirty` run/.test(read(path))), [])
})

test('every judge counts its runs', () => {
  assert.deepEqual(
    ['skills/doc-validate/SKILL.md', 'commands/tm-review.md'].filter((path) => !/^run: <1 on the first/m.test(read(path))),
    [],
  )
})

test('the stages of a ticket read the blockers from the script, not from memory', () => {
  const stages = ['commands/tm-design.md', 'commands/tm-plan.md', 'skills/implement/SKILL.md', PR]

  assert.deepEqual(stages.filter((path) => !read(path).includes(BLOCKER_STATE)), [])
})

test('a stop report opens with where each criterion stands', () => {
  assert.match(read(ASKING), /^## 7\. Hand off[^\n]*\n[\s\S]*\| AC \| State \| Blocked by \|/m)
})

test('a question never offers more than was asked, and always offers the least', () => {
  const asking = read(ASKING)

  assert.deepEqual(
    { widens: /never widens the request/.test(asking), minimal: /minimal variant/.test(asking), ownGate: /no recommended "approve"/.test(asking) },
    { widens: true, minimal: true, ownGate: true },
  )
})

test('an open prerequisite stays in every report until it is resolved', () => {
  assert.deepEqual(
    { progress: /^## Open prerequisites$/m.test(read('skills/implement/SKILL.md')), asking: /Open prerequisites/.test(read(ASKING)) },
    { progress: true, asking: true },
  )
})

test('the pull request is checked before it is opened and reported after', () => {
  const pr = read(PR)

  assert.deepEqual(
    {
      preflight: /^## Preflight$/m.test(pr),
      postflight: /^## Postflight$/m.test(pr),
      decisions: pr.includes('## Decisions that change the request'),
      path: pr.includes('.scratch/<feature-slug>/prs/<NN>-<slug>.md'),
      visibleDirect: pr.includes('Decided (supersedes'),
    },
    { preflight: true, postflight: true, decisions: true, path: true, visibleDirect: true },
  )
})

test('a ticket records where it lives in a tracker', () => {
  assert.match(read('templates/ticket.md'), /^- \*\*Tracker:\*\* /m)
})

test('trim and tidy check a proposal before they offer it', () => {
  assert.deepEqual(
    { tidy: /^\*\*Before proposing\*\*/m.test(read('skills/tidy/SKILL.md')), trim: /Before proposing/.test(read('skills/trim/SKILL.md')) },
    { tidy: true, trim: true },
  )
})

test('the gear is asked again when the work outgrows it', () => {
  assert.match(read('commands/tm-flow.md'), /\*\*Ask the gear again\*\*/)
})
