import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

// The documents link to each other with relative Markdown links, which GitHub and Obsidian both follow,
// and carry their gate fields as frontmatter properties, which Obsidian's Bases can filter. An ADR says
// where it applies and what it binds, so a decision can be traced to the requirements and features it
// constrains, and back.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const frontmatterOf = (path) => read(path).match(/^(?:<!--[\s\S]*?-->\n+)?---\n([\s\S]*?)\n---\n/)?.[1] ?? ''
const keysOf = (frontmatter) => (frontmatter.match(/^[a-z_-]+(?=:)/gm) ?? [])

const LIVING_TEMPLATES = ['prd.md', 'hld.md', 'components.md', 'boundaries.md', 'features-index.md', 'feature-readme.md', 'fdd.md']

function markdownFiles(dir) {
  return readdirSync(join(root, dir), { recursive: true })
    .filter((path) => path.endsWith('.md'))
    .map((path) => join(dir, path))
}

// A link inside the plugin's own documents that points at nothing is the defect the projects' docs
// are checked for (`LK-N`); the plugin holds itself to it first. Placeholders (`<feature>`) and
// absolute or external targets are not files of this repository, and a link shown inside code is an
// example, not a link.
test('every relative link in the plugin resolves', () => {
  const LINK = /\]\(([^)\s#]+)(?:#[^)]*)?\)/g
  const withoutCode = (text) => text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  const sources = [...markdownFiles('commands'), ...markdownFiles('skills'), ...markdownFiles('agents'), ...markdownFiles('docs'), 'README.md']
  const broken = sources.flatMap((path) =>
    [...withoutCode(read(path)).matchAll(LINK)]
      .map(([, target]) => target)
      .filter((target) => !/^[a-z]+:|^\/|[<>$]/.test(target))
      .filter((target) => !existsSync(normalize(join(root, dirname(path), target))))
      .map((target) => `${path}: ${target}`),
  )

  assert.deepEqual(broken, [])
})

test('every living-document template carries its gate fields as properties', () => {
  const missing = LIVING_TEMPLATES.flatMap((template) =>
    ['kind', 'status'].filter((key) => !keysOf(frontmatterOf(`templates/${template}`)).includes(key)).map((key) => `${template}: ${key}`),
  )

  assert.deepEqual(missing, [])
})

test('a living-document template keeps its status in one place', () => {
  const twice = LIVING_TEMPLATES.filter((template) => /^- \*\*Status:\*\*/m.test(read(`templates/${template}`)))

  assert.deepEqual(twice, [])
})

test('an ADR says where it applies, what it binds, and when it was found', () => {
  const keys = keysOf(frontmatterOf('templates/adr.md'))
  const expected = ['scope', 'subprojects', 'requirements', 'features', 'retroactive', 'discovered', 'formalized']

  assert.deepEqual(expected.filter((key) => !keys.includes(key)), [])
})

test('a single decision is triaged by its own command', () => {
  const command = 'commands/tm-adr-propose.md'

  assert.deepEqual(
    { exists: existsSync(join(root, command)), delegates: existsSync(join(root, command)) && read(command).includes('`adr-analyzer`') },
    { exists: true, delegates: true },
  )
})

test('the three markers are callouts', () => {
  const asking = read('skills/asking/SKILL.md')

  assert.deepEqual(
    ['> [!CAUTION]', '> [!WARNING]', '> [!NOTE]'].filter((callout) => !asking.includes(callout)),
    [],
  )
})

test('the FDD asks who may do what', () => {
  assert.match(read('templates/fdd.md'), /^## Authorization\b/m)
})

test('doc validation checks links and ADR coverage', () => {
  const skill = read('skills/doc-validate/SKILL.md')

  assert.deepEqual(
    { links: /\| `LK-N` \|/.test(skill), adrPair: /\| `adr → features` \|/.test(skill) },
    { links: true, adrPair: true },
  )
})
