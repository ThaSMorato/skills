import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// A retro of 0.7.0 over 65 Claude Code sessions and 356 Codex threads found almost all of its cost in
// input tokens: a context of 200k and more, re-sent on every call. Each instruction pinned here makes
// a stage re-send it less often, or keeps what it loads small enough to read in part.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : '')
const commands = readdirSync(join(root, 'commands')).map((file) => `commands/${file}`)
const LIVING_WRITERS = ['agents/prd-writer.md', 'agents/hld-writer.md', 'agents/boundary-architect.md', 'agents/fdd-writer.md']

test('a living document is read by its outline and the sections an effort touches', () => {
  const living = read('skills/doc-validate/living.md')

  assert.deepEqual(
    {
      outline: /\*\*Read the outline, then the sections\b/.test(living),
      searchesBeforeAdding: /search the document for it/.test(living),
      whole: ['skills/doc-validate/living.md', ...LIVING_WRITERS].filter((path) => /read (it|them) whole/.test(read(path))),
    },
    { outline: true, searchesBeforeAdding: true, whole: [] },
  )
})

test('a validation fails a living document that outgrew its size budget', () => {
  const validate = read('skills/doc-validate/SKILL.md')

  assert.deepEqual(
    { category: /^\| `DS-N` \| Document size \|/m.test(validate), script: validate.includes('${CLAUDE_PLUGIN_ROOT}/scripts/doc-size.mjs'), writer: /doc-size\.mjs/.test(read('skills/doc-validate/living.md')) },
    { category: true, script: true, writer: true },
  )
})

test('the serialization of the PRD lives beside the document, not inside it', () => {
  const template = read('templates/prd.md')

  assert.deepEqual(
    {
      inline: /```json/.test(template) || /^## JSON contract/m.test(template),
      sidecar: ['templates/prd.md', 'agents/prd-writer.md', 'skills/doc-validate/SKILL.md'].filter((path) => !read(path).includes('prd.contract.json')),
      movesAnOldOne: /still carries[^\n]*`## JSON contract`[^\n]*move/.test(read('agents/prd-writer.md')),
    },
    { inline: false, sidecar: [], movesAnOldOne: true },
  )
})

test('asking is a short core, with the markers, the gate and the handoff read on the branch that needs them', () => {
  const core = read('skills/asking/SKILL.md')
  const sectionsOf = (file) => (read(`skills/asking/${file}`).match(/^## \d/gm) ?? []).join(' ')

  assert.deepEqual(
    {
      short: Buffer.byteLength(core) < 10_000,
      pointers: ['markers.md', 'gates.md', 'handoff.md'].filter((file) => !core.includes(`[\`${file}\`](${file})`)),
      core: sectionsOf('SKILL.md'),
      markers: sectionsOf('markers.md'),
      gates: sectionsOf('gates.md'),
      handoff: sectionsOf('handoff.md'),
    },
    { short: true, pointers: [], core: '## 1 ## 2 ## 3', markers: '## 4 ## 6', gates: '## 5', handoff: '## 7' },
  )
})

test('no command restates the asking skill beside the call that loads it', () => {
  assert.deepEqual(commands.filter((path) => /resolve every id to what it means/.test(read(path))), [])
})

test('a stage hands off into a fresh context: /clear, then the next command', () => {
  assert.deepEqual(
    {
      handoff: /you run: `\/clear`, then `\/tm-plan-validate 03-checkout`/.test(read('skills/asking/SKILL.md')),
      anatomy: /you run: `\/clear`, then `\/tm-plan-validate 03-checkout`/.test(read('docs/anatomy/command-anatomy.md')),
      flow: /`\/clear`/.test(read('commands/tm-flow.md')),
      implement: /`\/clear`, then `\/tm-review /.test(read('skills/implement/SKILL.md')),
      codex: /`\/new`, then/.test(read('codex/skills/asking/SKILL.md')) && !/`\/clear`/.test(read('codex/skills/asking/SKILL.md')),
    },
    { handoff: true, anatomy: true, flow: true, implement: true, codex: true },
  )
})

test('a command or an agent that takes time is waited on once, in both harnesses', () => {
  const codexImplement = read('codex/skills/tm-implement/SKILL.md')

  assert.deepEqual(
    {
      rule: /\*\*One wait per command\.\*\*/.test(read('skills/implement/SKILL.md')),
      perStep: /once per SI/.test(read('skills/implement/SKILL.md')),
      codexTools: ['`yield_time_ms`', '`wait_agent`', '`send_message`'].filter((tool) => !codexImplement.includes(tool)),
    },
    { rule: true, perStep: true, codexTools: [] },
  )
})

test('the acceptance checker is sent to the screen, and says which source it opened and why', () => {
  const checker = read('agents/acceptance-checker.md')

  assert.deepEqual(
    {
      dispatch: /the route[^\n]*the control/.test(read('skills/acceptance/SKILL.md')),
      snapshot: /snapshot/.test(checker),
      reported: /\*\*Source read:\*\*/.test(checker),
    },
    { dispatch: true, snapshot: true, reported: true },
  )
})

test('the review resolves the changed files and their guides once, and skips a lens whose surface the diff does not touch', () => {
  const review = read('commands/tm-review.md')
  const standards = read('agents/review-standards.md')

  assert.deepEqual(
    {
      fileList: /git diff --name-only/.test(review),
      guidesOnce: /resolve the standard once[^\n]*routing table/.test(review),
      skips: ['`review-ui`', '`review-data`'].filter((lens) => !new RegExp(`${lens}[^\\n]*only when the diff touches`).test(review)),
      docsOnly: /documentation only/.test(review),
      lensLoadsAll: /Load \*\*every stack guide\*\*/.test(standards),
      lensReadsWhatWasPassed: /the stack guides[^\n]*`\/tm-review` resolved/.test(standards),
    },
    { fileList: true, guidesOnce: true, skips: [], docsOnly: true, lensLoadsAll: false, lensReadsWhatWasPassed: true },
  )
})

test('every fan-out names the agent it dispatches, so the model never picks one', () => {
  assert.match(read('skills/flow-report/SKILL.md'), /call the Agent tool with an exploration agent once per project/)
})
