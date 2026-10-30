import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Two sessions of the same project at once collide on the first thing they share: a port, a
// database, an env file. The project writes down how a second copy runs; the coordinator reads every
// worktree and prints new ones only when the owner asks; a merge that resolved a conflict is followed
// by what the other branch brought, before anything is called done.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : '')
const WORKTREES = '${CLAUDE_PLUGIN_ROOT}/scripts/worktrees.mjs'
const AFTER_MERGE = '${CLAUDE_PLUGIN_ROOT}/skills/implement/after-merge.md'

test('the environment contract for parallel sessions is its own document, written by the guidelines stage', () => {
  const template = read('templates/parallel-sessions.md')

  assert.deepEqual(
    {
      sections: ['Ports', 'Database', 'Env file', 'Automations', '.scratch in a worktree'].filter((section) => !new RegExp(`^## \\d+\\. ${section.replace('.', '\\.')}`, 'm').test(template)),
      writer: read('agents/guideline-generator.md').includes('docs/parallel-sessions.md'),
      routed: read('templates/guidelines.md').includes('docs/parallel-sessions.md'),
      asksGaps: /to be established[^\n]*ask/.test(read('commands/tm-guidelines.md')),
    },
    { sections: [], writer: true, routed: true, asksGaps: true },
  )
})

test('the env file is described by its variable names, never by a value', () => {
  assert.match(read('agents/guideline-generator.md'), /names only[^\n]*never a value[^\n]*never `\.env` itself/)
})

test('the coordinator reads every worktree before it builds the matrix', () => {
  const flow = read('commands/tm-flow.md')

  assert.deepEqual({ script: flow.includes(WORKTREES), column: /\| ticket \| worktree \|/.test(flow) }, { script: true, column: true })
})

test('worktree commands are printed only when the owner asks, and never run', () => {
  const flow = read('commands/tm-flow.md')

  assert.deepEqual(
    { asks: /worktrees of their own/.test(flow), add: flow.includes(`${WORKTREES}" add`), neverRuns: /\*\*Print, never run\.\*\*/.test(flow) },
    { asks: true, add: true, neverRuns: true },
  )
})

test('the report asks the worktree question when frontier tickets can run at once, and keeps the worktree column', () => {
  const flow = read('commands/tm-flow.md')

  assert.deepEqual(
    { asked: /^The \*\*frontier\*\*[^\n]*parallel-safe with each other[^\n]*worktree question/m.test(flow), column: /worktree column is kept/.test(flow) },
    { asked: true, column: true },
  )
})

test('a merge that resolved a conflict is followed by the same steps wherever it happens', () => {
  const afterMerge = read('skills/implement/after-merge.md')

  assert.deepEqual(
    {
      steps: ['Install', 'Regenerate', 'Rerun the area', 'Recheck acceptance'].filter((step) => !afterMerge.includes(`**${step}`)),
      implement: read('skills/implement/SKILL.md').includes(AFTER_MERGE),
      pr: read('skills/pr/SKILL.md').includes(AFTER_MERGE),
      flow: read('commands/tm-flow.md').includes(AFTER_MERGE),
    },
    { steps: [], implement: true, pr: true, flow: true },
  )
})

test('a session in a linked worktree takes its port and database from the contract', () => {
  assert.match(read('skills/implement/SKILL.md'), /linked worktree[^\n]*docs\/parallel-sessions\.md/)
})
