import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Acceptance is the last look before the work is called done, and the look is only as good as what
// it can tell apart: a screen it drove from a picture it took, an API it called from one it did not,
// a check that failed from one that never ran because another failed, a criterion met in the DOM
// from one a user can see. It is also only as honest as whoever looks: not the session that wrote
// the code.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const ACCEPTANCE = 'skills/acceptance/SKILL.md'
const CHECKER = 'agents/acceptance-checker.md'
const VISUAL_CHECKS = 'skills/acceptance/visual-checks.md'

test('the verdicts are checked by an agent that cannot edit the code', () => {
  const checker = existsSync(join(root, CHECKER)) ? read(CHECKER) : ''

  assert.deepEqual(
    { denied: /^disallowedTools: Edit, NotebookEdit$/m.test(checker), dispatched: read(ACCEPTANCE).includes('call the Agent tool with `acceptance-checker`') },
    { denied: true, dispatched: true },
  )
})

test('a check without a screen has its own verdict, and so does a requirement that is measured', () => {
  assert.match(read(ACCEPTANCE), /^by_verdict: \{browser: <n>, http: <n>, run: <n>, test: <n>, measured: <n>, not_verified: <n>, blocked: <n>\}$/m)
})

test('a browser verdict says whether anything was checked beyond the picture', () => {
  assert.match(read(ACCEPTANCE), /\| # \| Item \(quoted\) \| Source \| Verdict \| Check \| Evidence \|/)
})

test('a visual check is mechanical where it can be', () => {
  const visual = existsSync(join(root, VISUAL_CHECKS)) ? read(VISUAL_CHECKS) : ''

  assert.deepEqual(
    {
      checks: ['naturalWidth', 'elementFromPoint', 'overflow', 'viewport'].filter((check) => !visual.includes(check)),
      acceptance: read(ACCEPTANCE).includes('visual-checks.md'),
      uiAudit: read('skills/ui-audit/technical.md').includes('acceptance/visual-checks.md'),
    },
    { checks: [], acceptance: true, uiAudit: true },
  )
})

test('an item that depends on a failed one is blocked, not failed', () => {
  assert.match(read(ACCEPTANCE), /\*\*Depends on:\*\*/)
})

test('what the stage provides to run the checks is recorded and put back', () => {
  assert.match(read(ACCEPTANCE), /^## Means provided$/m)
})

test('the exploratory pass only suggests', () => {
  assert.match(read(ACCEPTANCE), /^## Suggested cases$/m)
})
