import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Skills, commands and agents are read from YAML frontmatter, and a value that does not parse makes the
// file silently not load: the only signal is a startup warning. The usual break is an unquoted value
// holding ": " (read as a nested mapping), " #" (read as a comment), or opening with a YAML indicator.
// This checks every top-level scalar for those, without a YAML dependency.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const INDICATOR_START = /^[[\]{}>|*&!%@`,?]/

const files = [
  ...readdirSync(join(root, 'skills'))
    .filter((name) => existsSync(join(root, 'skills', name, 'SKILL.md')))
    .map((name) => join('skills', name, 'SKILL.md')),
  ...readdirSync(join(root, 'commands')).filter((f) => f.endsWith('.md')).map((f) => join('commands', f)),
  ...readdirSync(join(root, 'agents')).filter((f) => f.endsWith('.md')).map((f) => join('agents', f)),
]

function frontmatterLines(path) {
  const match = readFileSync(join(root, path), 'utf8').match(/^---\n([\s\S]*?)\n---\n/)
  return match ? match[1].split('\n') : null
}

function problemsIn(value) {
  if (value === '') return []
  if (value.startsWith("'")) return /^'(?:[^']|'')*'$/.test(value) ? [] : ['unbalanced single quotes']
  if (value.startsWith('"')) return /^"(?:[^"\\]|\\.)*"$/.test(value) ? [] : ['unbalanced double quotes']
  const problems = []
  if (value.includes(': ')) problems.push('unquoted ": "')
  if (value.includes(' #')) problems.push('unquoted " #"')
  if (INDICATOR_START.test(value)) problems.push(`unquoted value starting with "${value[0]}"`)
  return problems
}

test('every skill, command and agent has frontmatter', () => {
  assert.deepEqual(files.filter((path) => frontmatterLines(path) === null), [])
})

test('no frontmatter value breaks the YAML parse', () => {
  const broken = files.flatMap((path) =>
    (frontmatterLines(path) ?? [])
      .map((line) => line.match(/^([A-Za-z][\w-]*):\s?(.*?)\s*$/))
      .filter(Boolean)
      .flatMap(([, key, value]) => problemsIn(value).map((p) => `${path} ${key}: ${p}`)),
  )

  assert.deepEqual(broken, [])
})
