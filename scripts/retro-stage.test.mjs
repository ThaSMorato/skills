import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// A review of the retro stage against its own rules found its command, skill and template saying
// different things: the command repeated the skill and had drifted from it, the template had no place
// for half of what the skill measured, and two reference files disagreed on what a defect is. Each
// rule now has one home, and these tests fail when a second copy comes back.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const bodyOf = (path) => read(path).replace(/^---\n[\s\S]*?\n---\n/, '')
const sectionOf = (text, heading) => text.split(new RegExp(`^## ${heading}.*$`, 'm'))[1]?.split(/^## /m)[0] ?? ''

test('the command is a pointer: the stage has no rule outside its skill', () => {
  const command = bodyOf('commands/tm-retro.md')

  assert.deepEqual(
    { reads: command.includes('Read `${CLAUDE_PLUGIN_ROOT}/skills/retro/SKILL.md` and follow it'), headings: command.match(/^## .+$/gm) ?? [], restatesFinished: /completed/.test(command) },
    { reads: true, headings: [], restatesFinished: false },
  )
})

test('every step of the workflow ends on a completion criterion', () => {
  const workflow = sectionOf(read('skills/retro/SKILL.md'), 'Workflow')
  const steps = workflow.match(/^\d+\. /gm) ?? []

  assert.deepEqual({ steps: steps.length > 0, withCriterion: (workflow.match(/\*\*Done when\*\*/g) ?? []).length }, { steps: true, withCriterion: steps.length })
})

test('the workflow names the split by author, the sentinel check and the cost, which the script measures', () => {
  const workflow = sectionOf(read('skills/retro/SKILL.md'), 'Workflow')

  assert.deepEqual(['by author', 'Instructions, per harness', 'Minutes'].filter((part) => !workflow.includes(part)), [])
})

test('a defect is a repo-code finding, counted once', () => {
  assert.deepEqual(
    {
      counted: /defect: <n>/.test(read('templates/retro.md')),
      level: /defect[^\n]*`repo-code` finding/.test(read('skills/retro/SKILL.md')),
      threeKinds: /process, product, or defect/.test(read('skills/retro/SKILL.md')),
      aKindOfProductFinding: /^- \*\*Kind:\*\*.*defect/m.test(read('templates/evolutions.md')),
    },
    { counted: false, level: true, threeKinds: false, aKindOfProductFinding: false },
  )
})

test('the promotion filter gates what becomes prose, and a mechanical finding goes straight to a check', () => {
  const filter = read('skills/retro/promotion-filter.md')

  assert.deepEqual(
    { straight: /mechanical[^\n]*straight to a check/i.test(filter), oldName: /project findings?/i.test(filter), environment: /mechanical one is proposed as a check without it/.test(read('skills/retro/environment.md')) },
    { straight: true, oldName: false, environment: true },
  )
})

test('the environment lens says which stage reads each category, and the retro takes every one read from disk', () => {
  const template = read('templates/retro.md')

  assert.deepEqual(
    {
      readBy: /^\| Category \| Look for \| Evidence \| Read by \|$/m.test(read('skills/retro/environment.md')),
      everyDiskCategory: /every category[^\n]*`\/tm-retro`/.test(read('skills/retro/SKILL.md')),
      slots: ['**Guardrail:**', '**Automated checks:**', '**Navigation:**', '**Coding standards:**', '**Information access:**', '**From the sessions:**'].filter((slot) => !template.includes(slot)),
    },
    { readBy: true, everyDiskCategory: true, slots: [] },
  )
})

test('a retro is a dated file that names what it covered, so a second run over the same scope adds one', () => {
  const dated = 'docs/retro/<YYYY-MM-DD>-<scope>.md'
  const template = read('templates/retro.md')

  assert.deepEqual(
    {
      dated: ['skills/retro/SKILL.md', 'templates/README.md'].filter((path) => !read(path).includes(dated)),
      undated: ['skills/retro/SKILL.md', 'templates/README.md', 'templates/retro.md', 'commands/tm-flow.md'].filter((path) => read(path).includes('docs/retro/<scope>.md')),
      covered: /^features: \[.*\]\ntickets: \[.*\]$/m.test(template),
    },
    { dated: [], undated: [], covered: true },
  )
})
