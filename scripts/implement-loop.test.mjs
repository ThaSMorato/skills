import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The implement loop spends its window on test logs, blames an SI for a failure that was there before
// it started, and calls a change done when only its TypeScript compiled. Each of these is a field or a
// step the loop now has, and these tests hold them in place.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const IMPLEMENT = 'skills/implement/SKILL.md'
const progressFrontmatter = read(IMPLEMENT).match(/```markdown\n---\nkind: progress\n([\s\S]*?)\n---\n/)?.[1] ?? ''

test('test runs happen in a subagent that returns only the summary', () => {
  assert.deepEqual(
    { agent: existsSync(join(root, 'agents/test-runner.md')), used: read(IMPLEMENT).includes('`test-runner`') },
    { agent: true, used: true },
  )
})

test('the loop knows what was already failing before it started', () => {
  assert.deepEqual(
    { field: /^baseline_failures: /m.test(progressFrontmatter), section: /^## Baseline$/m.test(read(IMPLEMENT)) },
    { field: true, section: true },
  )
})

test('preflight checks that the dependencies are installed', () => {
  assert.match(read(IMPLEMENT), /\*\*Dependencies installed:\*\*/)
})

test('final verification runs the built artifact, not only the compiler', () => {
  assert.match(read(IMPLEMENT), /\*\*Build smoke test:\*\*/)
})

test('a small adaptation is recorded as a deviation the spec review reads', () => {
  assert.deepEqual(
    { recorded: read(IMPLEMENT).includes('- **Deviation:**'), read: read('agents/review-spec.md').includes('Deviation:') },
    { recorded: true, read: true },
  )
})

test('every SI stop suggests what to keep across a compaction', () => {
  assert.match(read(IMPLEMENT), /\/compact keep:/)
})

test('an SI ends only at its own close-out', () => {
  assert.match(read(IMPLEMENT), /\*\*The SI ends at step 6\.\*\*/)
})
