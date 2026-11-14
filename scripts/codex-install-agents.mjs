#!/usr/bin/env node
// Installs the plugin's subagents into Codex. Codex does not load agents from a plugin, only from
// `~/.codex/agents/` (or `$CODEX_HOME/agents/`), so `$thasmorato-skills:tm-setup` runs this once per
// plugin version. Agent files cite plugin files as `<TM_ROOT>/...`; the install writes the absolute
// path of the installed package in their place. It also installs the `tm-review` profile: Codex
// ignores a subagent's `sandbox_mode`, so the review lenses are read-only only when the session is, and
// `codex -p tm-review` layers `<codexHome>/tm-review.config.toml` over the owner's config. The profile
// sets no model: the model is the owner's. Shipped inside the package as
// `skills/tm-setup/scripts/install-agents.mjs`, three folders below the package root.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_MARKER = '<TM_ROOT>'
const OWNED = '# thasmorato-skills '
const VERSION_FILE = 'thasmorato-skills.json'
export const REVIEW_PROFILE = 'tm-review.config.toml'

const isAgentFile = (name) => name.startsWith('tm-') && name.endsWith('.toml')
const isOwned = (path) => readFileSync(path, 'utf8').startsWith(OWNED)

/** Writes every package agent into `codexHome/agents`, removes the ones a newer version dropped. */
export function installAgents({ packageRoot, codexHome }) {
  const version = JSON.parse(readFileSync(join(packageRoot, '.codex-plugin', 'plugin.json'), 'utf8')).version
  const shipped = readdirSync(join(packageRoot, 'agents')).filter(isAgentFile).sort()
  const target = join(codexHome, 'agents')
  mkdirSync(target, { recursive: true })

  const profile = join(codexHome, REVIEW_PROFILE)
  const foreign = [
    ...shipped.map((name) => join(target, name)),
    profile,
  ].filter((path) => existsSync(path) && !isOwned(path))
  if (foreign.length) throw new Error(`refusing to overwrite files this plugin did not write: ${foreign.join(', ')}`)

  for (const name of shipped) {
    const content = readFileSync(join(packageRoot, 'agents', name), 'utf8').replaceAll(ROOT_MARKER, packageRoot)
    writeFileSync(join(target, name), content)
  }
  const removed = readdirSync(target)
    .filter((name) => isAgentFile(name) && !shipped.includes(name) && isOwned(join(target, name)))
    .sort()
  for (const name of removed) rmSync(join(target, name))

  writeFileSync(profile, reviewProfile(version))
  writeFileSync(join(codexHome, VERSION_FILE), `${JSON.stringify({ version, packageRoot }, null, 2)}\n`)
  return { version, installed: shipped, removed, profile: REVIEW_PROFILE }
}

// Read-only for the main thread and every subagent it spawns; a write the stage needs (its own report)
// is asked for, so the owner sees each one. The effort is the review's; the model stays the owner's.
function reviewProfile(version) {
  return [
    `${OWNED}${version}: the tm-review profile, installed by $thasmorato-skills:tm-setup`,
    'sandbox_mode = "read-only"',
    'approval_policy = "on-request"',
    'model_reasoning_effort = "high"',
    '',
  ].join('\n')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
  const codexHome = process.env.CODEX_HOME || join(homedir(), '.codex')
  const { version, installed, removed, profile } = installAgents({ packageRoot, codexHome })
  console.log(`thasmorato-skills ${version}: ${installed.length} agents installed in ${join(codexHome, 'agents')}`)
  console.log(`profile installed: ${join(codexHome, profile)} (run a review read-only with \`codex -p tm-review\`)`)
  if (removed.length) console.log(`removed agents an older version shipped: ${removed.join(', ')}`)
}
