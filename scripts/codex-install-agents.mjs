#!/usr/bin/env node
// Installs the plugin's subagents into Codex. Codex does not load agents from a plugin, only from
// `~/.codex/agents/` (or `$CODEX_HOME/agents/`), so `$thasmorato-skills:tm-setup` runs this once per
// plugin version. Agent files cite plugin files as `<TM_ROOT>/...`; the install writes the absolute
// path of the installed package in their place. Shipped inside the package as
// `skills/tm-setup/scripts/install-agents.mjs`, three folders below the package root.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_MARKER = '<TM_ROOT>'
const OWNED = '# thasmorato-skills '
const VERSION_FILE = 'thasmorato-skills.json'

const isAgentFile = (name) => name.startsWith('tm-') && name.endsWith('.toml')
const isOwned = (path) => readFileSync(path, 'utf8').startsWith(OWNED)

/** Writes every package agent into `codexHome/agents`, removes the ones a newer version dropped. */
export function installAgents({ packageRoot, codexHome }) {
  const version = JSON.parse(readFileSync(join(packageRoot, '.codex-plugin', 'plugin.json'), 'utf8')).version
  const shipped = readdirSync(join(packageRoot, 'agents')).filter(isAgentFile).sort()
  const target = join(codexHome, 'agents')
  mkdirSync(target, { recursive: true })

  const foreign = shipped.filter((name) => existsSync(join(target, name)) && !isOwned(join(target, name)))
  if (foreign.length) {
    throw new Error(`refusing to overwrite agents this plugin did not write: ${foreign.map((name) => join(target, name)).join(', ')}`)
  }

  for (const name of shipped) {
    const content = readFileSync(join(packageRoot, 'agents', name), 'utf8').replaceAll(ROOT_MARKER, packageRoot)
    writeFileSync(join(target, name), content)
  }
  const removed = readdirSync(target)
    .filter((name) => isAgentFile(name) && !shipped.includes(name) && isOwned(join(target, name)))
    .sort()
  for (const name of removed) rmSync(join(target, name))

  writeFileSync(join(codexHome, VERSION_FILE), `${JSON.stringify({ version, packageRoot }, null, 2)}\n`)
  return { version, installed: shipped, removed }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
  const codexHome = process.env.CODEX_HOME || join(homedir(), '.codex')
  const { version, installed, removed } = installAgents({ packageRoot, codexHome })
  console.log(`thasmorato-skills ${version}: ${installed.length} agents installed in ${join(codexHome, 'agents')}`)
  if (removed.length) console.log(`removed agents an older version shipped: ${removed.join(', ')}`)
}
