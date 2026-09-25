import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Skills are listed explicitly in plugin.json, not discovered from their folder: a skill that is on
// disk but not listed does not load, and nothing reports it. These tests make that omission fail.

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(join(repoRoot, '.claude-plugin', 'plugin.json'), 'utf8'))
const listedSkills = manifest.skills.map((path) => path.replace(/^\.\/skills\//, ''))
const skillsOnDisk = readdirSync(join(repoRoot, 'skills')).filter((name) =>
  existsSync(join(repoRoot, 'skills', name, 'SKILL.md')),
)

test('every skill folder on disk is listed in plugin.json', () => {
  const unlisted = skillsOnDisk.filter((name) => !listedSkills.includes(name))

  assert.deepEqual(unlisted, [])
})

test('every skill listed in plugin.json exists on disk', () => {
  const missing = listedSkills.filter((name) => !skillsOnDisk.includes(name))

  assert.deepEqual(missing, [])
})
