import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { MEASURED_FIELDS } from './retro-measure.mjs'

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

// From the review of this wave: each rule below was a hole the first version left.

test('every citation of an asking section lands in the file that holds it', () => {
  const core = read('skills/asking/SKILL.md')
  const holds = (file, number) => new RegExp(`^## ${number}\\. `, 'm').test(read(`skills/asking/${file}`))
  const homeOf = (number) => (holds('SKILL.md', number) ? 'SKILL.md' : core.match(new RegExp(`\\[\`([a-z]+\\.md)\`\\][^\\n]*§${number}\\b`))?.[1])
  const sources = ['skills', 'commands', 'agents', 'templates', 'docs/anatomy'].flatMap((folder) => readdirSync(join(root, folder), { recursive: true }).filter((path) => path.endsWith('.md')).map((path) => `${folder}/${path}`))
  const cited = new Set(sources.flatMap((path) => [...read(path).matchAll(/`asking`[^\n§]{0,60}((?:§\d(?:[^\n§]{0,12})?)+)/g)].flatMap(([, list]) => [...list.matchAll(/§(\d)/g)].map(([, number]) => number))))

  assert.deepEqual(
    { cited: [...cited].sort().length >= 4, astray: [...cited].filter((number) => !homeOf(number) || !holds(homeOf(number), number)) },
    { cited: true, astray: [] },
  )
})

test('what only the conversation holds is written down before /clear', () => {
  assert.match(read('skills/asking/SKILL.md'), /no artifact records[^\n]*`\/tm-handoff`[^\n]*`\/clear`/)
})

test('a stage that names the next command names /clear before it, and none sends the owner on with /compact', () => {
  const closings = {
    'skills/acceptance/SKILL.md': /Next: `\/clear`, then `\/tm-walkthrough`/,
    'commands/tm-review.md': /the next steps are `\/clear`, then/,
    'commands/tm-tidy.md': /the next steps: `\/clear`, then/,
    'skills/ui-audit/SKILL.md': /Next: `\/clear`, then `\/tm-ui-design <screen>`/,
    'skills/ui-design/SKILL.md': /Next: `\/clear`, then `\/tm-tickets`/,
    'skills/plan-validate/SKILL.md': /`\/clear`, then `\/tm-implement <slug>`/,
  }

  assert.deepEqual(
    { silent: Object.entries(closings).filter(([path, closing]) => !closing.test(read(path))).map(([path]) => path), compacts: /`\/compact`, then `\/tm-implement/.test(read('skills/plan-validate/SKILL.md')) },
    { silent: [], compacts: false },
  )
})

test('the standards lens reads the non-negotiables on every review, and the decisions that bind the whole repository', () => {
  const standards = read('agents/review-standards.md')

  assert.deepEqual(
    {
      nonNegotiables: /\*\*Non-negotiables\*\* section, on every review/.test(standards),
      onlyWhenNoGuide: /Open `docs\/guidelines\.md` yourself only when no guide was passed/.test(standards),
      repoWide: /`scope` is `repo-wide`/.test(standards),
      byPath: /`grep` the features and paths/.test(standards),
    },
    { nonNegotiables: true, onlyWhenNoGuide: false, repoWide: true, byPath: false },
  )
})

test('only the ui and data lenses have a surface, the data one read from the hunks, and documentation only is defined', () => {
  const review = read('commands/tm-review.md')

  assert.deepEqual(
    {
      everyOtherRuns: /every other lens in the table runs on every diff/.test(review),
      dataFromHunks: /`review-data`[^\n]*decided from the hunks, not the file names/.test(review),
      docsOnlyDefined: /\*\*documentation only\*\*[^\n]*every changed file is prose a person reads[^\n]*`docs\/architecture\/boundaries\.md`/.test(review),
      inDoubt: /one in doubt, and the full set runs/.test(review),
    },
    { everyOtherRuns: true, dataFromHunks: true, docsOnlyDefined: true, inDoubt: true },
  )
})

test('moving the contract out of an old PRD is not a regression, and an old PRD is compared with the contract it still holds', () => {
  assert.deepEqual(
    {
      writerReports: /relocation, not a removal/.test(read('agents/prd-writer.md')),
      validatorAccepts: /`## JSON contract`[^\n]*moved, not removed/.test(read('skills/doc-validate/living.md')),
      oldPrd: /still carries it as a `## JSON contract` section: compare that one/.test(read('skills/doc-validate/SKILL.md')),
      migrated: /`## JSON contract`[^\n]*`docs\/product\/prd\.contract\.json`/.test(read('commands/tm-docs-migrate.md')),
    },
    { writerReports: true, validatorAccepts: true, oldPrd: true, migrated: true },
  )
})

test('the source the checker opened is kept in the acceptance record, where the retro counts it', () => {
  const stage = read('skills/acceptance/SKILL.md')

  assert.deepEqual(
    { counted: /^source_read: <count/m.test(stage), section: /^## Source read$/m.test(stage), measured: MEASURED_FIELDS.acceptance.includes('source_read') },
    { counted: true, section: true, measured: true },
  )
})

test('in Codex a wait that returns early is followed by another long one, never by short polls', () => {
  assert.match(read('codex/skills/tm-implement/SKILL.md'), /wait again with the same long value/)
})

test('the session analysis says what it reads after /clear: the session before, one session per stage', () => {
  const command = read('commands/tm-session-analyze.md')

  assert.deepEqual(
    { passesOver: /only ran this command[^\n]*is passed over/.test(command), perStage: /one session per stage/.test(command) && /one session per stage/.test(read('commands/tm-flow.md')) },
    { passesOver: true, perStage: true },
  )
})
