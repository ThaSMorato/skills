#!/usr/bin/env node
// Lists the agent extensions a repo declares for every teammate (MCP servers in .mcp.json and in
// .codex/config.toml; marketplaces, plugins and hooks in .claude/settings.json; the repo's own skills
// for either harness) and, for each, whether it is pinned: an exact version, a fixed image tag or
// digest, or a marketplace at a commit. Whether an unpinned one is a risk is a judgement, left to
// /tm-audit-deps.
// Env values are parsed but never returned: only their names leave this script. The personal
// .claude/settings.local.json is never read.
// Usage: node agent-extensions.mjs [--root <dir>]   (prints JSON)
// No dependencies beyond the Node standard library.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const PACKAGE_RUNNERS = new Set(['npx', 'bunx', 'uvx', 'pnpx'])
const DOCKER_FLAGS_WITH_VALUE = new Set(['-e', '--env', '--env-file', '-v', '--volume', '-p', '--publish', '--name', '--network', '-w', '--workdir', '--mount', '--entrypoint', '-u', '--user'])
const EXACT_NPM = /^(@[^/@]+\/)?[^@/]+@\d+\.\d+\.\d+([-+][\w.]+)?$/
const EXACT_PYTHON = /^[\w.-]+(==|@)\d+(\.\d+)*$/
const SKILL_FOLDERS = ['.claude/skills', '.agents/skills']

export function readAgentExtensions({ root }) {
  const files = []
  const read = (path, parse) => {
    if (!existsSync(join(root, path))) return null
    files.push(path)
    try {
      return parse(readFileSync(join(root, path), 'utf8'))
    } catch {
      // The parser's own message quotes the text around the error, which may be a secret.
      throw new Error(`${path} does not parse; open it and fix the syntax`)
    }
  }
  const mcp = read('.mcp.json', JSON.parse)
  const codex = read('.codex/config.toml', parseCodexServers)
  const settings = read('.claude/settings.json', JSON.parse)
  const extensions = [
    ...Object.entries(mcp?.mcpServers ?? {}).map(([name, server]) => mcpServer(name, server, '.mcp.json')),
    ...Object.entries(codex ?? {}).map(([name, server]) => mcpServer(name, server, '.codex/config.toml')),
    ...settingsExtensions(settings ?? {}),
    ...SKILL_FOLDERS.flatMap((folder) => repoSkills(root, folder)),
  ]
  return { root, files, extensions }
}

function mcpServer(name, server, file) {
  const env = Object.keys(server.env ?? {}).sort()
  if (server.url) return { kind: 'mcp-server', name, file, source: server.url, pinned: null, runs: null, env }
  const words = [server.command, ...(server.args ?? [])]
  return { kind: 'mcp-server', name, file, ...pinOf(words), runs: words.join(' '), env }
}

// What a command fetches and whether that is fixed: a package runner or a container image fetches
// from outside the repo; anything else runs the repo's own code, which has no version to pin.
function pinOf([command, ...args]) {
  if (PACKAGE_RUNNERS.has(command)) {
    const source = args.find((arg) => !arg.startsWith('-'))
    return { source, pinned: EXACT_NPM.test(source) || EXACT_PYTHON.test(source) }
  }
  if (command === 'docker') {
    const image = dockerImage(args)
    return { source: image, pinned: /@sha256:/.test(image) || /:(?!latest$)[\w.-]+$/.test(image.split('/').at(-1)) }
  }
  return { source: args.find((arg) => !arg.startsWith('-')) ?? command, pinned: null }
}

function dockerImage(args) {
  const afterRun = args.slice(args.indexOf('run') + 1)
  return afterRun.find((arg, index) => !arg.startsWith('-') && !DOCKER_FLAGS_WITH_VALUE.has(afterRun[index - 1]))
}

function settingsExtensions(settings) {
  const marketplaces = Object.entries(settings.extraKnownMarketplaces ?? {}).map(([name, { source }]) => marketplace(name, source))
  const pinnedBy = Object.fromEntries(marketplaces.map(({ name, pinned }) => [name, pinned]))
  const plugins = Object.entries(settings.enabledPlugins ?? {})
    .filter(([, enabled]) => enabled)
    .map(([name]) => {
      const from = name.split('@').at(-1)
      return { kind: 'plugin', name, file: '.claude/settings.json', source: from, pinned: pinnedBy[from] ?? null, runs: null, env: [] }
    })
  return [...marketplaces, ...plugins, ...hooks(settings.hooks ?? {})]
}

function marketplace(name, source) {
  const base = { kind: 'marketplace', name, file: '.claude/settings.json', runs: null, env: [] }
  if (source.source === 'directory') return { ...base, source: source.path, pinned: null }
  const where = source.source === 'github' ? `github:${source.repo}` : source.url
  if (source.sha) return { ...base, source: `${where}@${source.sha}`, pinned: true }
  return { ...base, source: source.ref ? `${where}#${source.ref}` : where, pinned: false }
}

function hooks(byEvent) {
  return Object.entries(byEvent).flatMap(([event, groups]) =>
    groups.flatMap(({ matcher, hooks: entries }) =>
      entries
        .filter(({ type }) => type === 'command')
        .map(({ command }) => ({
          kind: 'hook',
          name: matcher ? `${event} ${matcher}` : event,
          file: '.claude/settings.json',
          ...pinOf(command.split(/\s+/)),
          runs: command,
          env: [],
        })),
    ),
  )
}

function repoSkills(root, folder) {
  if (!existsSync(join(root, folder))) return []
  return readdirSync(join(root, folder), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(root, folder, entry.name, 'SKILL.md')))
    .map(({ name }) => ({
      kind: 'skill',
      name,
      file: `${folder}/${name}/SKILL.md`,
      source: null,
      pinned: null,
      runs: null,
      env: [],
      scripts: shippedScripts(root, join(folder, name)),
    }))
}

function shippedScripts(root, dir) {
  return readdirSync(join(root, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.endsWith('.md'))
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .sort()
}

// Only the [mcp_servers.<name>] tables of the Codex config, with string and string-array values and
// env as an inline or a nested table; every other table, and any other value type, is skipped. Env
// values are dropped here, and the quoted strings are removed before the keys of an inline table are
// read, so a value cannot be taken for a key.
function parseCodexServers(text) {
  const servers = {}
  let current = null
  for (const line of text.split('\n').map((raw) => raw.trim())) {
    const header = line.match(/^\[mcp_servers\.([\w-]+)(\.env)?\]$/)
    if (header) {
      servers[header[1]] ??= {}
      current = header[2] ? { env: (servers[header[1]].env ??= {}) } : { server: servers[header[1]] }
      continue
    }
    if (line.startsWith('[')) current = null
    const pair = line.match(/^([\w-]+)\s*=\s*(.+)$/)
    if (!current || !pair) continue
    if (current.env) current.env[pair[1]] = true
    else current.server[pair[1]] = pair[1] === 'env' ? inlineTableKeys(pair[2]) : tomlValue(pair[2])
  }
  return servers
}

function tomlValue(raw) {
  if (raw.startsWith('[')) return [...raw.matchAll(/"([^"]*)"/g)].map(([, value]) => value)
  return raw.match(/^"([^"]*)"/)?.[1] ?? null
}

function inlineTableKeys(raw) {
  const keysOnly = raw.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, '""')
  return Object.fromEntries([...keysOnly.matchAll(/([\w-]+)\s*=/g)].map(([, key]) => [key, true]))
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const at = process.argv.indexOf('--root')
  try {
    console.log(JSON.stringify(readAgentExtensions({ root: at === -1 ? process.cwd() : process.argv[at + 1] }), null, 2))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
