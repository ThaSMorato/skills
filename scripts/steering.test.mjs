import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The repo's instructions reach the agent only when they are where the harness looks, and they help
// only when they agree with each other. The guidelines stage points every harness at the guides,
// path by path, before the files exist; a validator reads them all for contradictions; the commands
// say where they run; and the guardrails catch dead code, cycles and warnings, and say how to fix an
// illegal import.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : '')
const STEERING_FILES = '${CLAUDE_PLUGIN_ROOT}/scripts/steering-files.mjs'

test('the guidelines stage points both harnesses at the guides, path by path, without copying them', () => {
  const generator = read('agents/guideline-generator.md')

  assert.deepEqual(
    {
      rules: /`\.claude\/rules\/<tech>\.md`[^\n]*`paths:`/.test(generator),
      subprojects: /`CLAUDE\.md`[^\n]*`AGENTS\.md`[^\n]*subproject/.test(generator),
      pointer: /a pointer, never the rule copied/.test(generator),
    },
    { rules: true, subprojects: true, pointer: true },
  )
})

test('the plan loads the guides of the files it will create, not only of those that exist', () => {
  assert.deepEqual(
    ['skills/ticket-plan/SKILL.md', 'skills/ticket-design/SKILL.md'].filter((path) => !/files it will create[^\n]*routing table/.test(read(path))),
    [],
  )
})

test('every command says where it runs: the host, a container, or either', () => {
  assert.deepEqual(
    {
      template: /\| Purpose \| Command \| Runs in \|/.test(read('templates/guidelines.md')),
      detected: /`Runs in`[^\n]*compose/.test(read('agents/guideline-generator.md')),
      plan: /`Runs in`/.test(read('skills/ticket-plan/SKILL.md')),
    },
    { template: true, detected: true, plan: true },
  )
})

test('a steering validator reads every instruction file and gives a verdict', () => {
  const skill = read('skills/steering-validate/SKILL.md')

  assert.deepEqual(
    {
      command: read('commands/tm-steering-validate.md').includes('skills/steering-validate/SKILL.md'),
      script: skill.includes(STEERING_FILES),
      categories: ['`CT`', '`SR`', '`DP`', '`SH`', '`PL`'].filter((id) => !skill.includes(id)),
      pluginIsInfo: /`PL`[^\n]*never makes it `dirty`/.test(skill),
      output: skill.includes('docs/validation/steering.md'),
      listed: [read('.claude-plugin/plugin.json').includes('./skills/steering-validate'), read('README.md').includes('/tm-steering-validate'), read('skills/README.md').includes('`steering-validate`'), read('commands/tm-flow.md').includes('docs/validation/steering.md')],
    },
    { command: true, script: true, categories: [], pluginIsInfo: true, output: true, listed: [true, true, true, true] },
  )
})

test('the guardrails inventory looks for dead code, cycles and warnings let through', () => {
  const guardrails = read('skills/guardrails/SKILL.md')

  assert.deepEqual(
    ['**dead code**', '**cycles**', '**warnings as errors**', '`knip`', '`vulture`', '`deadcode`', '`madge`'].filter((term) => !guardrails.includes(term)),
    [],
  )
})

test('each dependency-linter rule says what to do instead', () => {
  assert.match(read('skills/guardrails/SKILL.md'), /message names the fix[^\n]*call the service/)
})
