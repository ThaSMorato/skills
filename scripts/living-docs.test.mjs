import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// A living document describes the system now, and every effort amends it: a writer that can only
// rewrite the whole file erases what earlier efforts decided. What belongs to one effort (its
// milestone, its acceptance criteria) lives in `.scratch/<effort>/` and is absorbed into the living
// docs as rules once delivered, so no living document carries a criterion.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const frontmatterOf = (path) => read(path).match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? ''
const headingsOf = (path) => read(path).match(/^## .*$/gm) ?? []

const LIVING_RULES = 'skills/doc-validate/living.md'
const ABSORB_RULES = 'skills/acceptance/absorb.md'
const LIVING_WRITERS = ['prd-writer', 'hld-writer', 'component-mapper', 'boundary-architect', 'fdd-writer', 'decomposer']

function markdownFiles(dir) {
  return readdirSync(join(root, dir), { recursive: true })
    .filter((path) => path.endsWith('.md'))
    .map((path) => join(dir, path))
}

test('every writer of a living document can amend it by section', () => {
  const withoutEdit = LIVING_WRITERS.filter((agent) => !/^tools:.*\bEdit\b/m.test(frontmatterOf(`agents/${agent}.md`)))

  assert.deepEqual(withoutEdit, [])
})

test('every writer of a living document follows the amendment rules', () => {
  const unaware = LIVING_WRITERS.filter((agent) => !read(`agents/${agent}.md`).includes(LIVING_RULES))

  assert.deepEqual({ rules: existsSync(join(root, LIVING_RULES)), unaware }, { rules: true, unaware: [] })
})

test('no living-document template carries acceptance criteria or a milestone', () => {
  const effortOnly = /^## (Acceptance criteria|First milestone)\b/
  const carrying = ['fdd.md', 'prd.md', 'hld.md', 'components.md', 'boundaries.md', 'features-index.md', 'feature-readme.md']
    .flatMap((template) => headingsOf(`templates/${template}`).filter((heading) => effortOnly.test(heading)).map((heading) => `${template}: ${heading}`))

  assert.deepEqual(carrying, [])
})

test('the requirements of the living PRD carry no milestone tag', () => {
  assert.equal(/`M1`|`M2`/.test(read('templates/prd.md')), false)
})

test('the FDD states delivered behavior as rules', () => {
  assert.ok(headingsOf('templates/fdd.md').some((heading) => heading.startsWith('## Rules')))
})

test('what belongs to one effort has its own templates', () => {
  const templates = readdirSync(join(root, 'templates'))

  assert.deepEqual(['scope.md', 'criteria.md', 'feature-readme.md'].filter((name) => !templates.includes(name)), [])
})

// Criteria now live per effort, so a stage that still reads them from the FDD finds a section that
// is no longer there.
test('no stage reads acceptance criteria from the FDD', () => {
  const FDD_CRITERION = /FDD('s)? (acceptance )?criteri|criteri\w* (of|in|from) the FDD|FDD AC\b/i
  const sources = [...markdownFiles('commands'), ...markdownFiles('skills'), ...markdownFiles('agents'), ...markdownFiles('templates'), 'README.md']
    .filter((path) => path !== 'commands/tm-docs-migrate.md')
  const stale = sources.filter((path) => FDD_CRITERION.test(read(path)))

  assert.deepEqual(stale, [])
})

test('acceptance absorbs the delivered criteria into the feature docs', () => {
  assert.deepEqual(
    { rules: existsSync(join(root, ABSORB_RULES)), acceptance: read('skills/acceptance/SKILL.md').includes(ABSORB_RULES) },
    { rules: true, acceptance: true },
  )
})

test('doc validation checks an amended document against its previous version', () => {
  const skill = read('skills/doc-validate/SKILL.md')

  assert.deepEqual(
    { regression: /\| `RG-N` \|/.test(skill), criteriaPair: /\| `scope → criteria` \|/.test(skill), rules: skill.includes(LIVING_RULES) },
    { regression: true, criteriaPair: true, rules: true },
  )
})
