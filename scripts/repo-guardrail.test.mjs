import { test } from 'node:test'
import assert from 'node:assert/strict'
import { accessSync, constants, existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The retro's environment lens calls a repository with no pre-commit hook and no CI job a finding.
// This repository was one: its tests ran only when someone remembered the command. The hook and the
// CI job both run the one test script, so a change to how the tests run is a one-place edit.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : '')
const isExecutable = (path) => {
  try {
    accessSync(join(root, path), constants.X_OK)
    return true
  } catch {
    return false
  }
}
const workflows = () => {
  const dir = join(root, '.github', 'workflows')
  return existsSync(dir) ? readdirSync(dir).map((file) => read(join('.github', 'workflows', file))) : []
}

test('the test command is a package script, so the hook and CI name it once', () => {
  const scripts = JSON.parse(read('package.json') || '{}').scripts ?? {}

  assert.equal(scripts.test, 'node --test --test-reporter=dot scripts/*.test.mjs')
})

test('a pre-commit hook runs the test script', () => {
  assert.deepEqual(
    { executable: isExecutable('.githooks/pre-commit'), runsTests: /^npm test\b/m.test(read('.githooks/pre-commit')) },
    { executable: true, runsTests: true },
  )
})

test('a CI job runs the test script on every pull request', () => {
  const job = workflows().find((workflow) => /^\s+- run: npm test$/m.test(workflow)) ?? ''

  assert.match(job, /^on:\n(?:.*\n)*?\s+pull_request:/m)
})

test('the README says how a fresh clone turns the hook on', () => {
  assert.match(read('README.md'), /git config core\.hooksPath \.githooks/)
})
