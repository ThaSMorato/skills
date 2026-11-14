import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// How this project seeds a state, resets it and logs in a test account is found once, by the
// guidelines stage, and written in the router. The stages that need a known state read it there
// instead of rediscovering it per run; a password is named by where it comes from, never by its value.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : '')

test('the router has a row for seeding and one for resetting, and a table of test accounts', () => {
  const template = read('templates/guidelines.md')

  assert.deepEqual(
    {
      seed: /^\| Seed \|/m.test(template),
      reset: /^\| Reset the data \|/m.test(template),
      accounts: /\| Handle \| Role \| Password from \|/.test(template),
    },
    { seed: true, reset: true, accounts: true },
  )
})

test('the generator records the handle of a test account and where its password comes from, never the value', () => {
  const generator = read('agents/guideline-generator.md')

  assert.deepEqual(
    {
      section: /^## Seeds, resets and test accounts$/m.test(generator),
      neverTheValue: /where its password comes from[^\n]*never the value/.test(generator),
      notInvented: /`to be established`/.test(generator.split('## Seeds, resets and test accounts')[1] ?? ''),
    },
    { section: true, neverTheValue: true, notInvented: true },
  )
})

test('the guidelines stage asks the owner for the seed, reset and test account rows it could not find', () => {
  assert.match(read('commands/tm-guidelines.md'), /Seed`, `Reset the data` and test account rows[^\n]*`to be established`/)
})

test('acceptance and implement read the seed, the reset and the test account from the router before searching', () => {
  assert.deepEqual(
    {
      acceptance: /seed[^\n]*reset[^\n]*test account[^\n]*`docs\/guidelines\.md`/i.test(read('skills/acceptance/SKILL.md')),
      checker: /the test account's handle/.test(read('agents/acceptance-checker.md')),
      implement: /seed[^\n]*reset[^\n]*`docs\/guidelines\.md`/i.test(read('skills/implement/SKILL.md')),
    },
    { acceptance: true, checker: true, implement: true },
  )
})
