import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installAgents } from './codex-install-agents.mjs'

// The installer writes into the owner's own Codex home, next to agents other tools put there. It may
// only ever replace or remove what this plugin wrote, and it must leave no `<TM_ROOT>` behind.

const OWNED = '# thasmorato-skills 0.0.0: generated\n'

function aPackage({ version = '0.0.0', agents = { 'tm-reviewer.toml': `${OWNED}developer_instructions = '''\nRead <TM_ROOT>/x.md\n'''\n` } } = {}) {
  const packageRoot = mkdtempSync(join(tmpdir(), 'tm-package-'))
  mkdirSync(join(packageRoot, '.codex-plugin'))
  mkdirSync(join(packageRoot, 'agents'))
  writeFileSync(join(packageRoot, '.codex-plugin', 'plugin.json'), JSON.stringify({ version }))
  for (const [name, content] of Object.entries(agents)) writeFileSync(join(packageRoot, 'agents', name), content)
  return packageRoot
}

function aCodexHome(agents = {}) {
  const codexHome = mkdtempSync(join(tmpdir(), 'tm-codex-home-'))
  mkdirSync(join(codexHome, 'agents'))
  for (const [name, content] of Object.entries(agents)) writeFileSync(join(codexHome, 'agents', name), content)
  return codexHome
}

test('installs each agent with the package path in place of the root marker', () => {
  const packageRoot = aPackage()
  const codexHome = aCodexHome()

  installAgents({ packageRoot, codexHome })

  assert.match(readFileSync(join(codexHome, 'agents', 'tm-reviewer.toml'), 'utf8'), new RegExp(`Read ${packageRoot}/x\\.md`))
})

test('records the installed version for the stages to check', () => {
  const packageRoot = aPackage({ version: '9.9.9' })
  const codexHome = aCodexHome()

  installAgents({ packageRoot, codexHome })

  assert.deepEqual(JSON.parse(readFileSync(join(codexHome, 'thasmorato-skills.json'), 'utf8')), { version: '9.9.9', packageRoot })
})

test('refuses to overwrite an agent the plugin did not write, and writes nothing', () => {
  const packageRoot = aPackage()
  const codexHome = aCodexHome({ 'tm-reviewer.toml': 'name = "someone else"\n' })

  assert.throws(() => installAgents({ packageRoot, codexHome }), /did not write/)
  assert.equal(existsSync(join(codexHome, 'thasmorato-skills.json')), false)
})

test('removes an agent an older version shipped and keeps everyone else', () => {
  const packageRoot = aPackage()
  const codexHome = aCodexHome({ 'tm-dropped.toml': OWNED, 'tm-mine.toml': 'name = "the owner"\n', 'other.toml': OWNED })

  const { removed } = installAgents({ packageRoot, codexHome })

  assert.deepEqual(
    { removed, mine: existsSync(join(codexHome, 'agents', 'tm-mine.toml')), other: existsSync(join(codexHome, 'agents', 'other.toml')) },
    { removed: ['tm-dropped.toml'], mine: true, other: true },
  )
})
