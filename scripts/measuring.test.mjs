import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// What a stage cost is measured, not guessed: minutes and tool calls per stage from the session,
// the owner's re-invocations, answers outside the options, clarifications and overruled
// recommendations; per ticket in the retro, with the model and effort that did the work, and whether
// CI went red after the pull request opened. The cross-project report puts it beside the rest.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : '')

test('the meta-retro records the cost by stage, from the extract', () => {
  const metaRetro = read('templates/meta-retro.md')

  assert.deepEqual(
    {
      frontmatter: /^cost: \{minutes: <n>, idle_minutes: <n>, tool_calls: <n>, invocations: <n>, other_answers: <n>, clarifications: <n>, overrules: <n>\}$/m.test(metaRetro),
      section: /^## Cost by stage \(required\)$/m.test(metaRetro),
      stage: /Cost by stage[^\n]*index\.md/.test(read('commands/tm-session-analyze.md')),
      wasted: /wasted calls[^\n]*tool-economy/.test(read('commands/tm-session-analyze.md')),
    },
    { frontmatter: true, section: true, stage: true, wasted: true },
  )
})

test('a message the owner sent mid-turn is read as an owner turn', () => {
  assert.match(read('agents/session-segment-analyst.md'), /`queued`[^\n]*mid-turn/)
})

test('the retro sums the cost per ticket, with who did the work and at what effort', () => {
  const retro = read('templates/retro.md')

  assert.deepEqual(
    {
      columns: /\| Ticket \| Plugin version \| Model \| Effort \|[^\n]*\| Minutes \| Tool calls \| CI red after open \|/.test(retro),
      sums: /minutes and tool calls per ticket/.test(read('skills/retro/SKILL.md')),
      effort: /^effort: <the effort level/m.test(read('skills/implement/SKILL.md')),
    },
    { columns: true, sums: true, effort: true },
  )
})

test('the pull request leaves a record beside its body, with whether CI went red after it opened', () => {
  const pr = read('skills/pr/SKILL.md')

  assert.deepEqual(
    { record: pr.includes('prs/<NN>-<slug>.record.md'), field: /^ci_red_after_open: pending \| true \| false$/m.test(pr), state: read('scripts/flow-state.mjs').includes('.record.md') },
    { record: true, field: true, state: true },
  )
})

test('the cross-project report puts the cost beside the other measurements', () => {
  assert.deepEqual(
    { skill: /minutes and tool calls per ticket[^\n]*ci_red_after_open/.test(read('skills/flow-report/SKILL.md')), template: /Cost per ticket/.test(read('templates/flow-report.md')) },
    { skill: true, template: true },
  )
})
