#!/usr/bin/env node
// Keeps the list of retro and meta-retro reports written in any project, so /tm-flow-report finds
// them without being handed paths, and knows from the summary what each holds before opening it.
// /tm-retro and /tm-session-analyze record each report they write. The registry lives outside every
// project and every harness, so a report written in Claude Code and one written in Codex sit side by side.
// Usage: node report-registry.mjs record <report file> [--registry <path>]   (prints the entry)
//        node report-registry.mjs list [--registry <path>]                   (prints every entry)
// No dependencies beyond the Node standard library.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

import { readFrontmatter } from './artifact-frontmatter.mjs'

export const DEFAULT_REGISTRY = join(homedir(), '.thasmorato-skills', 'reports.json')
const REPORT_PATH = /^(.*)\/(docs\/(?:retro|meta-retro)\/[^/]+\.md)$/
const KINDS = ['retro', 'meta-retro']

export function recordReport({ report, registry = DEFAULT_REGISTRY }) {
  const entry = summarize(resolve(report))
  const reports = readRegistry(registry).filter((known) => !(known.repo === entry.repo && known.file === entry.file))
  mkdirSync(dirname(registry), { recursive: true })
  writeFileSync(registry, `${JSON.stringify({ reports: [...reports, entry] }, null, 2)}\n`)
  return entry
}

export function listReports({ registry = DEFAULT_REGISTRY }) {
  return { registry, reports: readRegistry(registry).map((entry) => ({ ...entry, found: existsSync(join(entry.repo, entry.file)) })) }
}

function summarize(report) {
  const [, repo, file] = report.match(REPORT_PATH) ?? []
  const fields = existsSync(report) ? readFrontmatter(readFileSync(report, 'utf8')) : null
  if (!repo || !KINDS.includes(fields?.kind)) throw new Error(`${report}: not a retro or a meta-retro under <repo>/docs/retro/ or <repo>/docs/meta-retro/`)
  return {
    repo,
    file,
    kind: fields.kind,
    date: fields.date ?? fields.analyzed_at ?? null,
    plugin_versions: pluginVersionsOf(fields),
    model: fields.model ?? null,
    harness: fields.harness ?? null,
    findings: typeof fields.findings === 'object' ? fields.findings : {},
  }
}

// A meta-retro is one session, on one version; a retro spans tickets that may have run on several.
function pluginVersionsOf(fields) {
  if (Array.isArray(fields.plugin_versions)) return fields.plugin_versions.map(String)
  return fields.plugin_version === undefined ? [] : [String(fields.plugin_version)]
}

function readRegistry(registry) {
  if (!existsSync(registry)) return []
  try {
    return JSON.parse(readFileSync(registry, 'utf8')).reports ?? []
  } catch (error) {
    throw new Error(`${registry}: not valid JSON (${error.message}); it is never overwritten, so fix or move it`)
  }
}

function parseArgs(argv) {
  const at = argv.indexOf('--registry')
  const registry = at === -1 ? DEFAULT_REGISTRY : argv[at + 1]
  const words = argv.filter((arg, index) => !arg.startsWith('--') && (at === -1 || index !== at + 1))
  if (words[0] === 'record' && words[1]) return { mode: 'record', report: words[1], registry }
  if (words[0] === 'list') return { mode: 'list', registry }
  throw new Error('Usage: node report-registry.mjs record <report file> | list [--registry <path>]')
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const args = parseArgs(process.argv.slice(2))
    console.log(JSON.stringify(args.mode === 'record' ? recordReport(args) : listReports(args), null, 2))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
