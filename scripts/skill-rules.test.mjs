import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Reference skills are routers: SKILL.md holds a table, and a rule file is read only when its row
// matches. A row pointing at a missing file fails silently at the moment of use, and a rule file no
// row points at is never read. These tests make both omissions fail.

const skillsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')
const RULE_REFERENCE = /rules\/[a-z0-9-]+\.md/g

const routerSkills = readdirSync(skillsRoot).filter((name) => existsSync(join(skillsRoot, name, 'rules')))

function referencedRules(skill) {
  const index = readFileSync(join(skillsRoot, skill, 'SKILL.md'), 'utf8')
  return [...new Set(index.match(RULE_REFERENCE) ?? [])].map((path) => path.replace('rules/', ''))
}

function rulesOnDisk(skill) {
  return readdirSync(join(skillsRoot, skill, 'rules')).filter((name) => name.endsWith('.md'))
}

for (const skill of routerSkills) {
  test(`${skill}: every rule its SKILL.md references exists`, () => {
    const missing = referencedRules(skill).filter((rule) => !rulesOnDisk(skill).includes(rule))

    assert.deepEqual(missing, [])
  })

  test(`${skill}: every rule file is referenced from its SKILL.md`, () => {
    const orphans = rulesOnDisk(skill).filter((rule) => !referencedRules(skill).includes(rule))

    assert.deepEqual(orphans, [])
  })
}
