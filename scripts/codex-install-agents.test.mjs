import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installAgents, REVIEW_PROFILE } from './codex-install-agents.mjs'

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

const readProfile = (codexHome) => readFileSync(join(codexHome, REVIEW_PROFILE), 'utf8')

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

// Codex ignores a subagent's sandbox_mode, so a review lens is read-only only when the whole session
// is. `codex -p tm-review` layers this profile file over the owner's config: read-only, every write
// asked for, the review's effort, and no model, because the model is the owner's to choose.

test('installs the tm-review profile next to the config: read-only, writes asked for, no model', () => {
  const codexHome = aCodexHome()

  installAgents({ packageRoot: aPackage(), codexHome })

  assert.deepEqual(
    { sandbox: /^sandbox_mode = "read-only"$/m.test(readProfile(codexHome)), approval: /^approval_policy = "on-request"$/m.test(readProfile(codexHome)), effort: /^model_reasoning_effort = "high"$/m.test(readProfile(codexHome)), model: /^model\s*=/m.test(readProfile(codexHome)) },
    { sandbox: true, approval: true, effort: true, model: false },
  )
})

test('replaces a profile it wrote, and refuses one the owner wrote, before writing anything', () => {
  const codexHome = aCodexHome()
  writeFileSync(join(codexHome, REVIEW_PROFILE), 'sandbox_mode = "workspace-write"\n')

  assert.throws(() => installAgents({ packageRoot: aPackage(), codexHome }), /did not write/)
  assert.deepEqual({ profile: readProfile(codexHome), agents: existsSync(join(codexHome, 'agents', 'tm-reviewer.toml')) }, { profile: 'sandbox_mode = "workspace-write"\n', agents: false })
})

test('the profile it wrote is rewritten on the next install', () => {
  const codexHome = aCodexHome()
  installAgents({ packageRoot: aPackage({ version: '1.0.0' }), codexHome })

  const { profile } = installAgents({ packageRoot: aPackage({ version: '2.0.0' }), codexHome })

  assert.deepEqual({ profile, header: readProfile(codexHome).split('\n')[0] }, { profile: REVIEW_PROFILE, header: '# thasmorato-skills 2.0.0: the tm-review profile, installed by $thasmorato-skills:tm-setup' })
})
