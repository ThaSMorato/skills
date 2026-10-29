import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// A suite is judged by what it would catch, not by how much of it there is. These hold the parts of
// the flow that ask that question: a case shown red before it is trusted, a mutant that survives the
// diff's tests, a suite audited for what it lacks and what it carries for nothing, an end-to-end spec
// that survives a re-plan, a guide that knows when it is old, a fix that looks for its siblings.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : '')
const MUTATE_ONCE = '${CLAUDE_PLUGIN_ROOT}/scripts/mutate-once.mjs'

test('every new case is shown red by a mutation before its SI closes', () => {
  assert.deepEqual(
    {
      implement: read('skills/implement/SKILL.md').includes(MUTATE_ONCE),
      progress: /^- \*\*Mutation:\*\* /m.test(read('skills/implement/SKILL.md')),
      plan: /the behavior that turns it red/.test(read('skills/ticket-plan/PLAN-FORMAT.md')),
      tdd: /guard, a mode, a count, a type or source text/.test(read('skills/tdd/SKILL.md')),
    },
    { implement: true, progress: true, plan: true, tdd: true },
  )
})

test('mutation testing is explained once, and its tool lives in the stack guide', () => {
  assert.deepEqual(
    { fundamentals: /^## Mutation testing$/m.test(read('skills/testing/fundamentals.md')), stackGuide: /mutation/i.test(read('skills/generate-stack-guide/SKILL.md')) },
    { fundamentals: true, stackGuide: true },
  )
})

test('the tests lens runs mutation on the diff and asks for the reason of an error', () => {
  const lens = read('agents/review-tests.md')

  assert.deepEqual({ mutants: /surviving mutant/.test(lens), reason: /asserts the reason/.test(lens) }, { mutants: true, reason: true })
})

test('the testing standard says what is worth a test and how many mocks are too many', () => {
  const fundamentals = read('skills/testing/fundamentals.md')

  assert.deepEqual(
    { worth: /^## Worth a test, and not$/m.test(fundamentals), mocks: /about three/.test(fundamentals) },
    { worth: true, mocks: true },
  )
})

test('a whole suite can be audited, at three levels', () => {
  const audit = read('skills/test-audit/SKILL.md')

  assert.deepEqual(
    {
      command: read('commands/tm-test-audit.md').includes('skills/test-audit/SKILL.md'),
      levels: ['`report`', '`confirm`', '`full`'].filter((level) => !audit.includes(level)),
      output: audit.includes('docs/analysis/test-audit.md'),
      listed: read('commands/tm-flow.md').includes('docs/analysis/test-audit.md'),
    },
    { command: true, levels: [], output: true, listed: true },
  )
})

test('the end-to-end spec of each criterion is reconciled when the plan changes', () => {
  const plan = read('skills/ticket-plan/SKILL.md')

  assert.deepEqual(
    {
      states: /new \| preserved \| manual \| updated \| deleted/.test(read('templates/e2e-spec.md')),
      planWrites: plan.includes('e2e.md'),
      implementReads: read('skills/implement/SKILL.md').includes('e2e.md'),
    },
    { states: true, planWrites: true, implementReads: true },
  )
})

test('a testing guide knows what it was generated from', () => {
  assert.deepEqual(
    { provenance: /## Provenance/.test(read('skills/generate-test-guide/SKILL.md')), scanned: /testing-guide-<project>[^\n]*Provenance/.test(read('commands/tm-flow.md')) },
    { provenance: true, scanned: true },
  )
})

test('a diagnosed defect is looked for elsewhere', () => {
  const diagnose = read('skills/diagnose/SKILL.md')

  assert.deepEqual({ sweep: /^## 7\. Sweep for the same defect$/m.test(diagnose), counted: /^siblings: /m.test(diagnose) }, { sweep: true, counted: true })
})
