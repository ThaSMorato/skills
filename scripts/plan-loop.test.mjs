import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The plan is the contract `/tm-implement` executes, and the validation is what lets it start. Both
// have to hold against the repository, not only against the documents above them: a verdict for a
// plan that changed since, a command the repo does not have, or a criterion that cannot be checked
// with the tickets delivered so far all reach the code with a `clean` on them.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const PLAN_VALIDATE = 'skills/plan-validate/SKILL.md'
const PLAN_FORMAT = 'skills/ticket-plan/PLAN-FORMAT.md'
const checkIds = (path) => [...read(path).matchAll(/^\| `([A-Z]+)-N` \|/gm)].map(([, id]) => id)

test('plan validation catches the consequences of a requirement and a criterion nobody can check yet', () => {
  assert.deepEqual(['RC', 'VB'].filter((id) => !checkIds(PLAN_VALIDATE).includes(id)), [])
})

test('a verdict belongs to the plan it validated', () => {
  assert.deepEqual(
    {
      recorded: /^plan_sha256: /m.test(read(PLAN_VALIDATE)),
      implementChecks: read('skills/implement/SKILL.md').includes('plan_sha256'),
      flowChecks: read('commands/tm-flow.md').includes('plan_sha256'),
    },
    { recorded: true, implementChecks: true, flowChecks: true },
  )
})

test('a plan declares what verification needs and what each SI changes', () => {
  const format = read(PLAN_FORMAT)

  assert.deepEqual(
    { prerequisites: /^## Verification prerequisites$/m.test(format), contracts: format.includes('- **Contracts changed:**') },
    { prerequisites: true, contracts: true },
  )
})

test('acceptance reports a check whose prerequisite is missing as blocked', () => {
  assert.match(read('skills/acceptance/SKILL.md'), /^by_verdict: \{[^}]*\bblocked: <n>/m)
})

test('a ticket slicing the owner decided is information, not a finding', () => {
  assert.match(read('skills/tickets-validate/SKILL.md'), /## Slicing/)
})

test('the node map reads the repo gates and the observers of what changes', () => {
  const design = read('skills/ticket-design/SKILL.md')

  assert.deepEqual(
    { gates: design.includes('commit and CI gates'), observers: /^## Observers$/m.test(design) },
    { gates: true, observers: true },
  )
})
