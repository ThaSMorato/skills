import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// A wave's entry was added before the oldest release heading instead of inside its own release, so
// half of 0.7.0 read as part of 0.3.0. Each release heading owns the waves below it until the next one.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
const version = JSON.parse(readFileSync(join(root, '.claude-plugin', 'plugin.json'), 'utf8')).version

const releaseOf = (heading) => {
  const before = changelog.slice(0, changelog.indexOf(heading))
  return [...before.matchAll(/^## (\S+)/gm)].at(-1)?.[1]
}

test('every wave entry sits under the release it shipped in', () => {
  const waves = [...changelog.matchAll(/^### Wave .+$/gm)].map(([heading]) => heading)

  // Releases were cut in waves from 0.7.0 on; a wave under an older heading is misplaced.
  const fromWaves = (release = '0') => release.split('.').map(Number).reduce((diff, part, index) => diff || part - [0, 7, 0][index], 0) >= 0

  assert.deepEqual(waves.filter((heading) => !fromWaves(releaseOf(heading))), [])
})

test('the current version is released, not in progress', () => {
  assert.match(changelog, new RegExp(`^## ${version.replaceAll('.', '\\.')}$`, 'm'))
})
