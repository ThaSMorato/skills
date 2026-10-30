import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// An agent runs outside the main conversation, so the effort it thinks at can be set where it is
// defined and stays predictable. A misspelled `effort` is ignored without a warning, which is why every
// agent must declare one of the accepted values. The level follows the work: the writers, analysts and
// reviewers think hard, the generators that transcribe a decided document do not, and the scout only
// collects for someone else to synthesize.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max']
const MECHANICAL = ['adr-generator', 'adr-linker', 'c4-generator', 'mermaid-generator', 'guideline-generator']
const COLLECTORS = ['pattern-scout', 'test-runner']

const agents = readdirSync(join(root, 'agents')).map((file) => file.replace(/\.md$/, ''))
const effortOf = (agent) =>
  readFileSync(join(root, 'agents', `${agent}.md`), 'utf8').match(/^---\n[\s\S]*?^effort: (\S+)$[\s\S]*?\n---\n/m)?.[1]

test('every agent declares an accepted effort', () => {
  const undeclared = agents.filter((agent) => !EFFORTS.includes(effortOf(agent)))

  assert.deepEqual(undeclared, [])
})

test('the effort follows the kind of work', () => {
  const expected = (agent) => (COLLECTORS.includes(agent) ? 'low' : MECHANICAL.includes(agent) ? 'medium' : 'high')
  const mismatched = agents.filter((agent) => effortOf(agent) !== expected(agent)).map((agent) => `${agent}: ${effortOf(agent)}`)

  assert.deepEqual(mismatched, [])
})
