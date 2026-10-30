import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The stages that look back write a report and stop. A finding about the plugin is never fixed from
// inside a project: it waits for /tm-flow-report. A convention of one team lands in that repo's own
// skills, and a defect in its code. The reports record themselves, so the cross-project report finds
// them, and the counts they rest on are read by a script, not out of prose.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : '')
const LEVELS = '${CLAUDE_PLUGIN_ROOT}/skills/retro/levels.md'
const REGISTRY = '${CLAUDE_PLUGIN_ROOT}/scripts/report-registry.mjs'
const FLOW_STATE = '${CLAUDE_PLUGIN_ROOT}/scripts/flow-state.mjs'
const LOOKING_BACK = ['commands/tm-retro.md', 'skills/retro/SKILL.md', 'commands/tm-session-analyze.md', 'agents/session-segment-analyst.md', 'skills/flow-report/SKILL.md']

test('the three levels are written once and cited by every stage that tags a finding', () => {
  const levels = read('skills/retro/levels.md')

  assert.deepEqual(
    {
      levels: ['`flow`', '`repo-skill`', '`repo-code`'].filter((level) => !levels.includes(level)),
      lowest: /lowest level that resolves/.test(levels),
      extends: /extends the plugin's[^\n]*without copying/.test(levels),
      citing: LOOKING_BACK.filter((path) => !read(path).includes(LEVELS)),
    },
    { levels: [], lowest: true, extends: true, citing: [] },
  )
})

test('the old two-level tag is gone from the stages that tag', () => {
  assert.deepEqual(LOOKING_BACK.filter((path) => /tag: flow \| project|`flow` \/ `project`|`flow` or `project`/.test(read(path))), [])
})

test('retro and session-analyze write the report and stop, with no invitation to act', () => {
  const stages = ['commands/tm-retro.md', 'commands/tm-session-analyze.md']

  assert.deepEqual(
    { invites: stages.filter((path) => /ask what to act on/i.test(read(path))), stops: stages.filter((path) => !/\*\*Then stop\.\*\*/.test(read(path))) },
    { invites: [], stops: [] },
  )
})

test('no stage that looks back edits a plugin file', () => {
  assert.deepEqual(
    {
      editing: LOOKING_BACK.filter((path) => /\b(edit|modify|patch|rewrite)\b[^.\n]*\$\{CLAUDE_PLUGIN_ROOT\}/i.test(read(path))),
      neverHere: /never edited from inside a project/.test(read('skills/retro/levels.md')),
      analystTools: /^tools: .*\b(Edit|Write)\b/m.test(read('agents/session-segment-analyst.md')),
    },
    { editing: [], neverHere: true, analystTools: false },
  )
})

test('both reports count their findings by level', () => {
  assert.deepEqual(
    {
      retro: /^findings: \{flow: <n>, repo-skill: <n>, repo-code: <n>, product: <n>, defect: <n>\}$/m.test(read('templates/retro.md')),
      metaRetro: /^findings: \{flow: <n>, repo-skill: <n>, repo-code: <n>\}$/m.test(read('templates/meta-retro.md')),
    },
    { retro: true, metaRetro: true },
  )
})

test('every report records itself, and the cross-project report reads the registry when given no path', () => {
  assert.deepEqual(
    {
      retro: read('commands/tm-retro.md').includes(`${REGISTRY}" record`),
      session: read('commands/tm-session-analyze.md').includes(`${REGISTRY}" record`),
      flowReport: read('skills/flow-report/SKILL.md').includes(`${REGISTRY}" list`),
      neutralPath: read('scripts/report-registry.mjs').includes("'.thasmorato-skills', 'reports.json'"),
    },
    { retro: true, session: true, flowReport: true, neutralPath: true },
  )
})

test('the matrix and the counts come from the flow-state script', () => {
  assert.deepEqual(
    ['commands/tm-flow.md', 'skills/retro/SKILL.md', 'skills/flow-report/SKILL.md'].filter((path) => !read(path).includes(FLOW_STATE)),
    [],
  )
})

test('the last ticket of a feature names the retro as what comes next, for the owner', () => {
  assert.match(read('skills/implement/SKILL.md'), /awaiting-retro[^\n]*the owner runs `\/tm-retro/)
})

test('a pre-existing finding that a new one copies is marked as its precedent, and the retro ranks it first', () => {
  assert.deepEqual(
    {
      verifier: /pre-existing \(precedent of <n>\)/.test(read('agents/review-verifier.md')),
      counted: /^precedents: <n>/m.test(read('agents/review-verifier.md')),
      review: /precedents/.test(read('commands/tm-review.md')),
      retro: /precedent[^\n]*ahead of/.test(read('skills/retro/SKILL.md')),
    },
    { verifier: true, counted: true, review: true, retro: true },
  )
})
