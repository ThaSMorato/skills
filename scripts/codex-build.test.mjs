import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCodexPackage, translate, KNOWLEDGE_SKILLS, PACKAGE_DIR } from './build-codex.mjs'
import { installAgents } from './codex-install-agents.mjs'

// The Codex package is generated from the Claude Code source, never edited by hand. Codex reads only
// what is inside the package (its plugin cache copies the package root and refuses `..`), has no
// Skill or Agent tool, no `${CLAUDE_PLUGIN_ROOT}` and no `$ARGUMENTS`, and does not ship subagents
// with a plugin. Each test below is one of those differences that, missed, fails only when a stage runs.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const built = buildCodexPackage(root)
const paths = [...built.keys()]
const read = (path) => built.get(path)

const commandNames = readdirSync(join(root, 'commands')).map((file) => file.replace(/\.md$/, ''))
const skillNames = readdirSync(join(root, 'skills')).filter((name) => !name.includes('.'))
const agentNames = readdirSync(join(root, 'agents')).map((file) => file.replace(/\.md$/, ''))
const version = JSON.parse(readFileSync(join(root, '.claude-plugin', 'plugin.json'), 'utf8')).version

const entrySkill = (name) => `skills/${name}/SKILL.md`
const entryOf = (path) => path.match(/^skills\/([^/]+)\//)?.[1]
const textFiles = paths.filter((path) => /\.(md|toml|yaml|json)$/.test(path))

test('the committed package is what the build produces', () => {
  const stale = paths.filter((path) => {
    try {
      return readFileSync(join(root, PACKAGE_DIR, path), 'utf8') !== read(path)
    } catch {
      return true
    }
  })
  const committed = readdirSync(join(root, PACKAGE_DIR), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(join(root, PACKAGE_DIR).length + 1))
  const orphaned = committed.filter((path) => !built.has(path))

  assert.deepEqual({ stale, orphaned }, { stale: [], orphaned: [] }, 'run `node scripts/build-codex.mjs`')
})

test('no Claude Code mechanism survives in the package', () => {
  // "Call the Skill tool with `a`, then with `b`": the second name loses its tool, and in Codex its path.
  const CLAUDE_ONLY = /Skill tool|Agent tool|CLAUDE_PLUGIN_ROOT|\$ARGUMENTS|in a single message|(?:then|and) with `[a-z0-9-]+`/
  const leaked = textFiles.filter((path) => CLAUDE_ONLY.test(read(path)))

  assert.deepEqual(leaked, [])
})

test('every command has a locked entry skill', () => {
  const missing = commandNames.filter((name) => !built.has(entrySkill(name)))
  const unlocked = [...commandNames, 'tm-setup']
    .filter((name) => built.has(entrySkill(name)))
    .filter((name) => !/allow_implicit_invocation: false/.test(read(`skills/${name}/agents/openai.yaml`) ?? ''))

  assert.deepEqual({ missing, unlocked }, { missing: [], unlocked: [] })
})

test('every knowledge skill is exposed and left open to the model', () => {
  const missing = KNOWLEDGE_SKILLS.filter((name) => !built.has(`skills/${name}/SKILL.md`))
  const locked = KNOWLEDGE_SKILLS.filter((name) => built.has(`skills/${name}/agents/openai.yaml`))

  assert.deepEqual({ missing, locked }, { missing: [], locked: [] })
})

// A skill that is neither knowledge nor loaded by an entry would ship nowhere in Codex.
// Codex registers every SKILL.md under the skills root, nested ones included: a copied stage skill
// named SKILL.md would be a second, unlocked way into that stage.
test('only entries and knowledge skills are named SKILL.md', () => {
  const registered = paths.filter((path) => /(^|\/)skill\.md$/i.test(path))
  const expected = [...commandNames, 'tm-setup'].map(entrySkill).concat(KNOWLEDGE_SKILLS.map((name) => `skills/${name}/SKILL.md`))

  assert.deepEqual(registered.sort(), expected.sort())
})

test('every skill ships, as knowledge or inside an entry', () => {
  const shipped = (name) =>
    KNOWLEDGE_SKILLS.includes(name) || paths.some((path) => path.endsWith(`/references/skills/${name}/index.md`))

  assert.deepEqual(skillNames.filter((name) => !shipped(name)), [])
})

test('every reference a skill cites exists inside that skill', () => {
  const CITED = /`(references\/[A-Za-z0-9_./-]+\.[a-z]+)`/g
  const missing = paths
    .filter((path) => path.startsWith('skills/') && path.endsWith('.md'))
    .flatMap((path) =>
      [...read(path).matchAll(CITED)]
        .map(([, cited]) => `skills/${entryOf(path)}/${cited}`)
        .filter((target) => !built.has(target))
        .map((target) => `${path}: ${target}`),
    )

  assert.deepEqual(missing, [])
})

test('every path an agent cites exists in the package', () => {
  const CITED = /(?:<TM_ROOT>|<plugin root>)\/([A-Za-z0-9_./-]+\.[a-z]+)/g
  const missing = paths
    .filter((path) => path.startsWith('agents/') || path.startsWith('agent-references/'))
    .flatMap((path) => [...read(path).matchAll(CITED)].map(([, cited]) => cited).filter((cited) => !built.has(cited)))

  assert.deepEqual(missing, [])
})

// The install rewrites `<TM_ROOT>` in the agent files it writes, and nowhere else: the package itself sits in
// Codex's plugin cache. A file an agent reads from the package must name the root in a way it can resolve.
function unresolvedAfterInstall() {
  const packageRoot = mkdtempSync(join(tmpdir(), 'tm-built-'))
  for (const [path, content] of built) {
    mkdirSync(dirname(join(packageRoot, path)), { recursive: true })
    writeFileSync(join(packageRoot, path), content)
  }
  const codexHome = mkdtempSync(join(tmpdir(), 'tm-codex-home-'))
  installAgents({ packageRoot, codexHome })

  const reached = new Set()
  const pending = readdirSync(join(codexHome, 'agents')).map((name) => join(codexHome, 'agents', name))
  while (pending.length) {
    const text = readFileSync(pending.pop(), 'utf8')
    for (const [, relativePath] of text.matchAll(new RegExp(`(?:${packageRoot}|<plugin root>)/([A-Za-z0-9_./-]+\\.md)`, 'g'))) {
      const cited = join(packageRoot, relativePath)
      if (reached.has(cited)) continue
      reached.add(cited)
      pending.push(cited)
    }
  }
  return [...reached].filter((path) => readFileSync(path, 'utf8').includes('<TM_ROOT>')).map((path) => path.slice(packageRoot.length + 1))
}

test('every file an agent reads after the install names the plugin root it can resolve', () => {
  assert.deepEqual(unresolvedAfterInstall(), [])
})

// A knowledge skill already ships at `skills/<name>/`, and the agents know the package root: a second
// copy for them is the same text twice.
test('agents read the knowledge skills where Codex exposes them, not a copy', () => {
  const copied = KNOWLEDGE_SKILLS.filter((name) => paths.some((path) => path.startsWith(`agent-references/skills/${name}/`)))
  const reviewQuality = read('agents/tm-review-quality.toml')

  assert.deepEqual(
    { copied, readsCleanCode: reviewQuality.includes('`<TM_ROOT>/skills/clean-code/SKILL.md`') },
    { copied: [], readsCleanCode: true },
  )
})

// A knowledge skill cites its own files relative to its folder (`references/…`, `naming.md`), as Codex
// expects of a skill; an agent reading one by absolute path has to be told where those start.
test('an agent is told that paths inside a file it reads start at that file\'s folder', () => {
  const untold = paths
    .filter((path) => path.startsWith('agents/'))
    .filter((path) => !/relative to the folder of the file that cites it/.test(read(path)))

  assert.deepEqual(untold, [])
})

test('every agent is generated, and every spawned agent exists', () => {
  const SPAWNED = /agent_type = "([a-z0-9-]+)"/g
  const generated = paths.filter((path) => path.startsWith('agents/')).map((path) => path.replace(/^agents\/|\.toml$/g, ''))
  const unknown = textFiles
    .flatMap((path) => [...read(path).matchAll(SPAWNED)].map(([, name]) => name))
    .filter((name) => name !== 'explorer' && !generated.includes(name))

  assert.deepEqual(
    { generated: generated.sort(), unknown: [...new Set(unknown)] },
    { generated: agentNames.map((name) => `tm-${name}`).sort(), unknown: [] },
  )
})

// Codex parses agent files with deny_unknown_fields: a Claude key such as `tools` breaks the parse.
test('agent files carry only the keys Codex accepts', () => {
  const ALLOWED = ['name', 'description', 'model_reasoning_effort', 'developer_instructions']
  const offending = paths
    .filter((path) => path.startsWith('agents/'))
    .filter((path) => {
      const [header, body] = read(path).split("developer_instructions = '''\n")
      const keys = [...header.matchAll(/^([a-z_]+) = /gm)].map(([, key]) => key)
      return body === undefined || body.indexOf("'''") !== body.length - 4 || keys.some((key) => !ALLOWED.includes(key))
    })

  assert.deepEqual(offending, [])
})

// The effort is the agent's, so it travels with the agent; the model does not. A model id ages in weeks
// and this suite is for anyone, so the model comes from the owner's profile or session.
test('an agent thinks at its own effort in Codex, on the model the owner chose', () => {
  const effortOf = (agent) => readFileSync(join(root, 'agents', `${agent}.md`), 'utf8').match(/^effort: (\S+)$/m)?.[1]
  const mismatched = agentNames.filter((agent) => {
    const toml = read(`agents/tm-${agent}.toml`)
    return !toml.includes(`\nmodel_reasoning_effort = "${effortOf(agent)}"\n`) || /^model = /m.test(toml)
  })

  assert.deepEqual(mismatched, [])
})

// The commands already carry `tm-`; the build adding its own would name every stage twice.
test('a stage has the same name in both harnesses', () => {
  const doubled = paths.filter((path) => path.includes('tm-tm-'))
  const renamed = commandNames.filter((name) => !built.has(`skills/${name}/SKILL.md`))

  assert.deepEqual({ doubled, renamed }, { doubled: [], renamed: [] })
})

test('an entry that spawns plugin agents checks the setup first', () => {
  const unchecked = paths
    .filter((path) => /^skills\/tm-[^/]+\/SKILL\.md$/.test(path))
    .filter((path) => {
      const entry = paths.filter((other) => other.startsWith(`skills/${entryOf(path)}/`)).map(read).join('\n')
      return /agent_type = "tm-/.test(entry) && !read(path).includes('$thasmorato-skills:tm-setup')
    })

  assert.deepEqual(unchecked, [])
})

test('stages are named the way Codex reaches them', () => {
  const SLASH = new RegExp(`(?<=[\\s\`(])/(${commandNames.join('|')})(?![\\w/-])`, 'g')
  const MENTION = /\$thasmorato-skills:(tm-[a-z0-9-]+)/g
  const slashes = textFiles.flatMap((path) => (read(path).match(SLASH) ?? []).map((found) => `${path}: ${found}`))
  const unknown = textFiles.flatMap((path) =>
    [...read(path).matchAll(MENTION)].map(([, name]) => name).filter((name) => name !== 'tm-setup' && !commandNames.includes(name)),
  )

  assert.deepEqual({ slashes, unknown: [...new Set(unknown)] }, { slashes: [], unknown: [] })
})

test('the Codex manifests carry the plugin version and point at the package', () => {
  const manifest = JSON.parse(read('.codex-plugin/plugin.json'))
  const marketplace = JSON.parse(readFileSync(join(root, '.agents', 'plugins', 'marketplace.json'), 'utf8'))
  const [plugin] = marketplace.plugins

  assert.deepEqual(
    { version: manifest.version, skills: manifest.skills, name: plugin.name, source: plugin.source },
    { version, skills: './skills/', name: 'thasmorato-skills', source: { source: 'local', path: `./${PACKAGE_DIR}` } },
  )
})

test('a phrase the translation table does not know stops the build', () => {
  assert.throws(() => translate('Ask the Skill tool nicely.', { file: 'commands/x.md', mode: 'entry' }), /commands\/x\.md/)
})

test('the Codex session analysis reads Codex sessions, with the module that does it', () => {
  const entry = read('skills/tm-session-analyze/SKILL.md')

  assert.deepEqual(
    { harness: /session-extract\.mjs" --harness codex/.test(entry), shipped: built.has('skills/tm-session-analyze/references/scripts/session-extract-codex.mjs') },
    { harness: true, shipped: true },
  )
})

test('every script in the package ships with the local modules it imports', () => {
  const missing = paths
    .filter((path) => path.endsWith('.mjs'))
    .flatMap((path) =>
      [...read(path).matchAll(/from '\.\/([^']+)'/g)]
        .map(([, imported]) => join(dirname(path), imported))
        .filter((imported) => !built.has(imported))
        .map((imported) => `${path}: ${imported}`),
    )

  assert.deepEqual(missing, [])
})
