import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { KNOWLEDGE_SKILLS } from './skill-kinds.mjs'

// The owner reaches the flow by typing its commands, and a bare name collides: Claude Code ships
// /plan, /review and /pr, and other plugins ship /implement, /retro and more. Every command carries the
// `tm-` prefix so nothing else can take its name, and the stage skills behind them leave the menu, so
// the only way in is the command.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const frontmatterOf = (path) => read(path).match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? ''

const commandNames = readdirSync(join(root, 'commands')).map((file) => file.replace(/\.md$/, ''))
const stageSkills = readdirSync(join(root, 'skills'))
  .filter((name) => existsSync(join(root, 'skills', name, 'SKILL.md')))
  .filter((name) => !KNOWLEDGE_SKILLS.includes(name))

function markdownFiles(dir) {
  return readdirSync(join(root, dir), { recursive: true })
    .filter((path) => path.endsWith('.md'))
    .map((path) => join(dir, path))
}

test('every command carries the tm- prefix', () => {
  assert.deepEqual(commandNames.filter((name) => !name.startsWith('tm-')), [])
})

test('every stage skill is out of the menu', () => {
  const listed = stageSkills.filter((name) => !/^user-invocable: false$/m.test(frontmatterOf(join('skills', name, 'SKILL.md'))))

  assert.deepEqual(listed, [])
})

// A stage cited by its old name sends the owner to a command that no longer exists, or to another
// plugin's. The CHANGELOG keeps the old names on purpose: it is the history and the migration table.
test('no file cites a command by its name without the prefix', () => {
  const unprefixed = commandNames.map((name) => name.replace(/^tm-/, ''))
  const OLD_NAME = new RegExp(`(?<![\\w.:/*>-])/(${unprefixed.join('|')})(?![\\w/-])`, 'g')
  const sources = [
    ...markdownFiles('commands'), ...markdownFiles('skills'), ...markdownFiles('agents'), ...markdownFiles('templates'),
    ...markdownFiles('docs'), ...markdownFiles('adapters'), 'README.md',
  ]
  const stale = sources.flatMap((path) => (read(path).match(OLD_NAME) ?? []).map((found) => `${path}: ${found}`))

  assert.deepEqual(stale, [])
})

// The rename to `tm-` rewrote `/plan` to `/tm-plan` wherever it appeared, including inside the paths of
// files a stage writes (`.scratch/<feature>/plans/<NN>-<slug>/plan.md`, `.scratch/<feature>/prs/<NN>-<slug>.md`).
// Those are artifact names, not commands: a stage writing `tm-plan.md` leaves `/tm-implement` and
// `/tm-flow` looking for a file that is never there.
test('no artifact path carries the command prefix', () => {
  const ARTIFACT_WITH_PREFIX = /[>*\]]\/tm-[a-z-]+\.md/g
  const sources = [
    ...markdownFiles('commands'), ...markdownFiles('skills'), ...markdownFiles('agents'), ...markdownFiles('templates'),
    ...markdownFiles('docs'), ...markdownFiles('adapters'), 'README.md',
  ]
  const prefixed = sources.flatMap((path) => (read(path).match(ARTIFACT_WITH_PREFIX) ?? []).map((found) => `${path}: ${found}`))

  assert.deepEqual(prefixed, [])
})
