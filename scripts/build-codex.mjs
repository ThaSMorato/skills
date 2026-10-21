#!/usr/bin/env node
// Generates the Codex package (`codex/`) from the Claude Code source. The source stays the only
// thing anyone edits; this file translates it. Run `node scripts/build-codex.mjs` to write the
// package, `node scripts/build-codex.mjs --check` to fail when the committed package is stale.
//
// What Codex lacks, and what replaces it here:
// - commands: each becomes a skill `tm-<command>`, locked to explicit `$thasmorato-skills:tm-<command>`;
// - the Skill tool: the skill's files are copied under the entry's `references/` and read from there;
// - the Agent tool: `spawn_agent` with `agent_type = "tm-<agent>"`, at most six running together;
// - `${CLAUDE_PLUGIN_ROOT}`: paths inside the entry, since Codex copies only the package and refuses `..`;
// - `$ARGUMENTS`: the text the user wrote after the skill name;
// - plugin subagents: TOML files that `$thasmorato-skills:tm-setup` installs into `~/.codex/agents/`.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { KNOWLEDGE_SKILLS, STAGE_ROOT_NOTE } from './skill-kinds.mjs'

export const PACKAGE_DIR = 'codex'
export { KNOWLEDGE_SKILLS }

const PLUGIN = 'thasmorato-skills'
const ROOT_MARKER = '<TM_ROOT>'
const AGENT_REFERENCES = 'agent-references'
const MAX_RUNNING_AGENTS = 6
const SETUP_SOURCE = 'adapters/codex/tm-setup.md'
const INSTALLER_SOURCE = 'scripts/codex-install-agents.mjs'
// Codex registers every SKILL.md under the skills root, nested ones too, so a copy goes by another name.
const COPIED_SKILL_FILE = 'index.md'
const copiedName = (path) => path.replace(/(^|\/)SKILL\.md$/, `$1${COPIED_SKILL_FILE}`)
const CLAUDE_ONLY = /Skill tool|Agent tool|CLAUDE_PLUGIN_ROOT|\$ARGUMENTS|in a single message|(?:then|and) with `[a-z0-9-]+`/

const ENTRY_PREAMBLE = [
  '> **Codex.** Paths that start with `references/` are inside this skill\'s folder (the folder of this `SKILL.md`);',
  '> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry',
  '> of this plugin: tell the owner to run it, never run it yourself.',
].join('\n')

const SETUP_CHECK = [
  '> **Codex setup.** This stage spawns plugin subagents. Before anything else, read',
  '> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`',
  '> is not `{version}`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.',
  '> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent\'s name.',
].join('\n')

const mention = (command) => `$${PLUGIN}:tm-${command}`

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { fields: {}, body: text }
  const fields = Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.match(/^([a-z-]+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, unquote(value.trim())]),
  )
  return { fields, body: text.slice(match[0].length) }
}

function unquote(value) {
  if (/^".*"$/.test(value)) return JSON.parse(value)
  if (/^'.*'$/.test(value)) return value.slice(1, -1).replaceAll("''", "'")
  return value
}

function filesIn(root, dir) {
  return readdirSync(join(root, dir), { recursive: true })
    .map((entry) => join(dir, entry))
    .filter((path) => statSync(join(root, path)).isFile() && !path.endsWith('.DS_Store'))
    .sort()
}

function readSource(root) {
  const read = (path) => readFileSync(join(root, path), 'utf8')
  const names = (dir, suffix) => readdirSync(join(root, dir)).filter((name) => name.endsWith(suffix)).map((name) => name.slice(0, -suffix.length))
  return {
    root,
    read,
    version: JSON.parse(read('.claude-plugin/plugin.json')).version,
    manifest: JSON.parse(read('.claude-plugin/plugin.json')),
    commands: names('commands', '.md').sort(),
    agents: names('agents', '.md').sort(),
    skills: readdirSync(join(root, 'skills')).filter((name) => existsSync(join(root, 'skills', name, 'SKILL.md'))).sort(),
  }
}

// ---- translation ------------------------------------------------------------------------------

/**
 * "Call the Skill tool with `a` (...), then with `b`" names the tool once for two skills. Spelling the
 * call out again ("then call the Skill tool with `b`") lets every later rule see both.
 */
function spellOutChainedCalls(text) {
  const CHAINED = /([Cc]all the (Skill|Agent) tool with `[a-z0-9-]+`[^.\n]*?)(,? )(then|and) with `([a-z0-9-]+)`/
  let out = text
  for (let match = out.match(CHAINED); match; match = out.match(CHAINED)) {
    const [whole, head, tool, gap, joiner, name] = match
    out = out.replace(whole, `${head}${gap}${joiner} call the ${tool} tool with \`${name}\``)
  }
  return out
}

/**
 * Rewrites Claude Code mechanisms into their Codex equivalents. `context.prefix` is where copied
 * plugin files live for the reader (`references/` in a skill, `<TM_ROOT>/agent-references/` in an
 * agent); `context.siblings` are the files of the skill the text belongs to, when it is a copy.
 */
export function translate(text, context) {
  const { file, prefix = 'references/', version = '', commands = [], siblings } = context
  const capital = (letter, word) => (letter === letter.toUpperCase() ? word[0].toUpperCase() : word[0]) + word.slice(1)
  let out = spellOutChainedCalls(text)
    .replace(`${STAGE_ROOT_NOTE}\n\n`, '')
    .replace(/<the "version" in \$\{CLAUDE_PLUGIN_ROOT\}\/\.claude-plugin\/plugin\.json>/g, version)
    .replace(/\$\{CLAUDE_PLUGIN_ROOT\}\/((?:templates|skills|scripts)\/[A-Za-z0-9_./-]+)/g, (_, path) => `${prefix}${copiedName(path)}`)
    .replace(/(scripts\/session-extract\.mjs")/g, '$1 --harness codex')
    .replace(/should call the Skill tool with first/g, 'should load first')
    .replace(/([Cc])all the Skill tool with each of:/g, (_, c) => `${capital(c, 'read')} each of these skills, at \`${prefix}skills/<name>/${COPIED_SKILL_FILE}\`:`)
    .replace(/([Cc])all the Skill tool with `([a-z0-9-]+)`/g, (_, c, name) => `${capital(c, 'read')} the \`${name}\` skill (\`${prefix}skills/${name}/${COPIED_SKILL_FILE}\`)`)
    .replace(/([Cc])all the Agent tool with `([a-z0-9-]+)`/g, (_, c, name) => `${c}all the \`spawn_agent\` tool with \`agent_type = "tm-${name}"\``)
    .replace(/([Cc])all the Agent tool with an exploration agent/g, (_, c) => `${c}all the \`spawn_agent\` tool with \`agent_type = "explorer"\``)
    .replace(/([Cc])all the Agent tool once per/g, (_, c) => `${c}all the \`spawn_agent\` tool once per`)
    .replace(/\*\*in a single message\*\*/g, `**at once** (at most ${MAX_RUNNING_AGENTS} running together; wait for every one)`)
    .replace(/in a single message/g, `at once (at most ${MAX_RUNNING_AGENTS} running together; wait for every one)`)
    .replace(/\$ARGUMENTS/g, 'the text after the skill name')
  if (commands.length) {
    out = out.replace(new RegExp(`(?<=[\\s\`(])/(${commands.join('|')})(?![\\w/-])`, 'g'), (_, name) => mention(name))
  }
  if (siblings) out = rewriteSiblings(out, siblings)

  const leftover = out.match(CLAUDE_ONLY)
  if (leftover) throw new Error(`${file}: no Codex translation for "${leftover[0]}"; add it to translate() in scripts/build-codex.mjs`)
  return out
}

function rewriteSiblings(text, { skill, files, prefix }) {
  return text.replace(/`([A-Za-z0-9_-]+(?:\/[A-Za-z0-9_.-]+)*\.[a-z]+)`/g, (whole, path) =>
    files.has(path) ? `\`${prefix}skills/${skill}/${copiedName(path)}\`` : whole,
  )
}

// ---- dependencies -----------------------------------------------------------------------------

/** The plugin files a text reaches: whole skill folders, and single templates and scripts. */
function dependenciesOf(text, skills) {
  const loaded = [...spellOutChainedCalls(text).matchAll(/[Cc]all the Skill tool with ([^.\n]*)/g)]
    .flatMap(([, rest]) => [...rest.matchAll(/`([a-z0-9-]+)`/g)].map(([, name]) => name))
    .filter((name) => skills.includes(name))
  const cited = [...text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/((?:templates|skills|scripts)\/[A-Za-z0-9_./-]+)/g)].map(([, path]) => path.replace(/[.,;:]+$/, ''))
  return {
    skills: [...loaded, ...cited.filter((path) => path.startsWith('skills/')).map((path) => path.split('/')[1])],
    files: cited.filter((path) => !path.startsWith('skills/')),
  }
}

/** The plugin-relative paths of the local modules a script imports. */
function localImportsOf(source, path) {
  return [...source.read(path).matchAll(/from '\.\/([^']+)'/g)].map(([, imported]) => join(dirname(path), imported))
}

/** Every file reachable from `texts`, following skills into their own files and scripts into their imports. */
function closure(source, texts, ownSkill) {
  const skills = new Set()
  const files = new Set()
  const pending = [...texts]
  while (pending.length) {
    const deps = dependenciesOf(pending.pop(), source.skills)
    for (const path of deps.files) {
      if (files.has(path)) continue
      if (!existsSync(join(source.root, path))) throw new Error(`cited plugin file does not exist: ${path}`)
      files.add(path)
      if (path.endsWith('.md')) pending.push(source.read(path))
      if (path.endsWith('.mjs')) pending.push(...localImportsOf(source, path).map((imported) => `\${CLAUDE_PLUGIN_ROOT}/${imported}`))
    }
    for (const skill of deps.skills) {
      if (skills.has(skill) || skill === ownSkill) continue
      skills.add(skill)
      pending.push(...filesIn(source.root, `skills/${skill}`).filter((path) => path.endsWith('.md')).map(source.read))
    }
  }
  return { skills: [...skills].sort(), files: [...files].sort() }
}

// ---- emitters ---------------------------------------------------------------------------------

function skillFrontmatter(name, description) {
  return `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\n`
}

const LOCK = 'policy:\n  allow_implicit_invocation: false\n'

/** Copies a closure under `base`, translating Markdown with paths that resolve from `prefix`. */
function emitReferences(source, out, { base, prefix, deps, file }) {
  const translateCopy = (path, siblings) =>
    path.endsWith('.md')
      ? translate(source.read(path), { file: `${file} > ${path}`, prefix, version: source.version, commands: source.commands, siblings })
      : source.read(path)
  for (const skill of deps.skills) {
    const own = filesIn(source.root, `skills/${skill}`)
    const files = new Set(own.map((path) => relative(join('skills', skill), path)))
    for (const path of own) out.set(`${base}/${copiedName(path)}`, translateCopy(path, { skill, files, prefix }))
  }
  for (const path of deps.files) out.set(`${base}/${path}`, translateCopy(path))
}

function emitEntry(source, out, command) {
  const { fields, body } = parseFrontmatter(source.read(`commands/${command}.md`))
  const dir = `skills/tm-${command}`
  const file = `commands/${command}.md`
  const deps = closure(source, [body])
  emitReferences(source, out, { base: `${dir}/references`, prefix: 'references/', deps, file })

  const translated = translate(body, { file, version: source.version, commands: source.commands })
  const hint = fields['argument-hint'] && translate(fields['argument-hint'], { file, commands: source.commands })
  const argument = hint ? `**Argument** (the text after the skill name): ${hint}\n\n` : ''
  const spawns = [translated, ...[...out].filter(([path]) => path.startsWith(`${dir}/`)).map(([, text]) => text)].some((text) =>
    text.includes('agent_type = "tm-'),
  )
  const check = spawns ? `${SETUP_CHECK.replace('{version}', source.version)}\n\n` : ''
  const description = translate(fields.description, { file, commands: source.commands })
  out.set(`${dir}/SKILL.md`, `${skillFrontmatter(`tm-${command}`, description)}${ENTRY_PREAMBLE}\n\n${check}${argument}${translated}`)
  out.set(`${dir}/agents/openai.yaml`, LOCK)
}

function emitKnowledge(source, out, skill) {
  const dir = `skills/${skill}`
  const own = filesIn(source.root, dir)
  const deps = closure(source, own.filter((path) => path.endsWith('.md')).map(source.read), skill)
  emitReferences(source, out, { base: `${dir}/references`, prefix: 'references/', deps, file: dir })
  for (const path of own) {
    const text = source.read(path)
    out.set(path, path.endsWith('.md') ? translate(text, { file: path, version: source.version, commands: source.commands }) : text)
  }
}

function tomlBasic(value) {
  return JSON.stringify(value)
}

function emitAgents(source, out) {
  const prefix = `${ROOT_MARKER}/${AGENT_REFERENCES}/`
  const bodies = source.agents.map((agent) => [agent, parseFrontmatter(source.read(`agents/${agent}.md`))])
  const deps = closure(source, bodies.map(([, { body }]) => body))
  emitReferences(source, out, { base: AGENT_REFERENCES, prefix, deps, file: 'agents' })
  for (const [agent, { fields, body }] of bodies) {
    const file = `agents/${agent}.md`
    const instructions = translate(body, { file, prefix, version: source.version, commands: source.commands })
    if (instructions.includes("'''")) throw new Error(`${file}: contains ''' and cannot be a TOML literal string`)
    out.set(
      `agents/tm-${agent}.toml`,
      [
        `# ${PLUGIN} ${source.version}: generated from ${file} by scripts/build-codex.mjs; installed by $${PLUGIN}:tm-setup`,
        `name = ${tomlBasic(`tm-${agent}`)}`,
        `description = ${tomlBasic(translate(fields.description, { file, commands: source.commands }))}`,
        `developer_instructions = '''\n${instructions.trimEnd()}\n'''\n`,
      ].join('\n'),
    )
  }
}

function emitSetup(source, out) {
  const { fields, body } = parseFrontmatter(source.read(SETUP_SOURCE))
  out.set('skills/tm-setup/SKILL.md', `${skillFrontmatter('tm-setup', fields.description)}${body.replaceAll('{version}', source.version)}`)
  out.set('skills/tm-setup/agents/openai.yaml', LOCK)
  out.set('skills/tm-setup/scripts/install-agents.mjs', source.read(INSTALLER_SOURCE))
}

function emitManifest(source, out) {
  const { name, description, keywords } = source.manifest
  const manifest = {
    name,
    version: source.version,
    description,
    keywords,
    skills: './skills/',
    interface: { displayName: name, shortDescription: 'AI Doc-Dev flow: interview, documentation, validated test-first development.', developerName: source.manifest.author.name, category: 'Coding', websiteURL: source.manifest.repository },
  }
  out.set('.codex-plugin/plugin.json', `${JSON.stringify(manifest, null, 2)}\n`)
}

/** The whole package, as package-relative path → content. */
export function buildCodexPackage(root) {
  const source = readSource(root)
  const out = new Map()
  for (const command of source.commands) emitEntry(source, out, command)
  for (const skill of KNOWLEDGE_SKILLS) emitKnowledge(source, out, skill)
  emitAgents(source, out)
  emitSetup(source, out)
  emitManifest(source, out)
  return new Map([...out].sort(([a], [b]) => a.localeCompare(b)))
}

// ---- CLI --------------------------------------------------------------------------------------

function writePackage(root, built) {
  const target = join(root, PACKAGE_DIR)
  rmSync(target, { recursive: true, force: true })
  for (const [path, content] of built) {
    mkdirSync(dirname(join(target, path)), { recursive: true })
    writeFileSync(join(target, path), content)
  }
}

function stalePaths(root, built) {
  const target = join(root, PACKAGE_DIR)
  const committed = existsSync(target) ? filesIn(root, PACKAGE_DIR).map((path) => relative(PACKAGE_DIR, path)) : []
  const changed = [...built].filter(([path, content]) => !existsSync(join(target, path)) || readFileSync(join(target, path), 'utf8') !== content)
  return [...changed.map(([path]) => path), ...committed.filter((path) => !built.has(path))]
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const built = buildCodexPackage(root)
  if (process.argv.includes('--check')) {
    const stale = stalePaths(root, built)
    if (stale.length) {
      console.error(`${PACKAGE_DIR}/ is stale (${stale.length} files); run node scripts/build-codex.mjs\n${stale.slice(0, 20).join('\n')}`)
      process.exit(1)
    }
    console.log(`${PACKAGE_DIR}/ is up to date (${built.size} files)`)
  } else {
    writePackage(root, built)
    console.log(`wrote ${built.size} files to ${PACKAGE_DIR}/`)
  }
}
