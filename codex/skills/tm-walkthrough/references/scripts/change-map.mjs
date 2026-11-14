#!/usr/bin/env node
// Draws the map a reviewer needs before reading a change: every file of the diff once, what kind of
// file it is (and whether it is only skimmed: a lockfile, a generated file, a pure rename), the links
// between the changed files (an import line in one that names the other), and an order to read them,
// each file after the files it depends on. Used by /tm-pr-map, /tm-walkthrough and /tm-pr.
// It reads git objects only (the diff between two refs and the files at the head), never the working
// tree, so it maps a pull request fetched as a ref without checking it out.
// Usage: node change-map.mjs --base <ref> --head <ref> [--root <dir>]   (prints JSON)
// No dependencies beyond the Node standard library.

import { spawnSync } from 'node:child_process'
import { posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOCKFILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'Gemfile.lock', 'poetry.lock', 'uv.lock',
  'Pipfile.lock', 'go.sum', 'Cargo.lock', 'composer.lock', 'mix.lock', 'pubspec.lock', 'Podfile.lock',
])
const KINDS = [
  ['generated', [/(^|\/)(generated|__generated__|dist|build|vendor)\//, /\.min\.(js|css)$/, /\.pb\.go$/, /_pb2\.py$/, /\.snap$/, /__snapshots__\//]],
  ['test', [/(^|\/)(tests?|spec|__tests__|e2e)\//, /\.(test|spec)\.[^./]+$/, /_test\.go$/, /(^|\/)test_[^/]+\.py$/, /_spec\.rb$/]],
  ['schema', [/(^|\/)migrations?\//, /\.(sql|prisma|proto|graphql|gql)$/, /(^|\/)(schema|openapi)\.[^/]+$/]],
  ['docs', [/(^|\/)docs\//, /\.(md|mdx|rst|adoc|txt)$/]],
  ['config', [/(^|\/)\.github\//, /(^|\/)(Dockerfile|Makefile)$/, /\.(json|ya?ml|toml|ini|cfg|conf)$/, /(^|\/)\.env\.example$/]],
]
const SKIMMED_KINDS = new Set(['lock', 'generated'])
const RANK = { schema: 0, source: 1, config: 2, test: 3, docs: 4 }
const SKIM_RANK = 5
const MODULE_INDEX = new Set(['index', '__init__', 'mod'])
const MAX_READ_BYTES = 1024 * 1024

export function classify({ path, status, added, deleted }) {
  const base = posix.basename(path)
  const kind = LOCKFILES.has(base) ? 'lock' : KINDS.find(([, patterns]) => patterns.some((pattern) => pattern.test(path)))?.[0] ?? 'source'
  if (SKIMMED_KINDS.has(kind)) return { kind, skim: true, reason: kind === 'lock' ? 'lockfile' : 'generated' }
  if (status === 'R' && added === 0 && deleted === 0) return { kind, skim: true, reason: 'pure rename' }
  return { kind, skim: false }
}

export function edgesBetween(contentByPath) {
  const paths = Object.keys(contentByPath)
  const edges = paths.flatMap((from) =>
    importSpecifiersIn(from, contentByPath[from]).flatMap((specifier) =>
      paths.filter((to) => to !== from && specifierNames(specifier, to)).map((to) => ({ from, to })),
    ),
  )
  return uniqueEdges(edges)
}

export function readingOrder(files, edges) {
  const rankOf = (file) => (file.skim ? SKIM_RANK : RANK[file.kind] ?? RANK.source)
  const groups = new Map()
  for (const file of files) groups.set(rankOf(file), [...(groups.get(rankOf(file)) ?? []), file.path])
  return [...groups.keys()].sort((a, b) => a - b).flatMap((rank) => dependenciesFirst(groups.get(rank), edges))
}

export function changeMap({ root, base, head }) {
  for (const ref of [base, head]) resolveRef(root, ref)
  const files = changedFiles(root, base, head).map((file) => ({ ...file, ...classify(file) }))
  const readable = files.filter((file) => file.status !== 'D' && !SKIMMED_KINDS.has(file.kind))
  const contentByPath = Object.fromEntries(readable.map((file) => [file.path, fileAt(root, head, file.path)]))
  const edges = edgesBetween(contentByPath)
  return { base, head, files, edges, order: readingOrder(files, edges) }
}

function importSpecifiersIn(path, text) {
  const specifiers = []
  let inGoImportBlock = false
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (inGoImportBlock) {
      if (line.startsWith(')')) inGoImportBlock = false
      else specifiers.push(...quotedIn(line))
      continue
    }
    if (/^import\s*\($/.test(line)) {
      inGoImportBlock = true
      continue
    }
    if (isImportLine(line)) specifiers.push(...specifiersOf(line))
  }
  return specifiers.map((specifier) => normalized(specifier, path)).filter(Boolean)
}

function isImportLine(line) {
  return (
    /^(import|from|#include|use|using|@import|require_relative|require)\b/.test(line) ||
    (/^export\b/.test(line) && /\sfrom\s/.test(line)) ||
    (/^(const|let|var)\b/.test(line) && /\brequire\s*\(/.test(line))
  )
}

function specifiersOf(line) {
  const quoted = quotedIn(line)
  if (quoted.length) return quoted
  const python = line.match(/^(?:from|import)\s+([\w.]+)/)
  return python ? [python[1].replaceAll('.', '/')] : []
}

function quotedIn(line) {
  return [...line.matchAll(/["'`]([^"'`]+)["'`]/g)].map(([, value]) => value)
}

function normalized(specifier, importer) {
  if (specifier.startsWith('.')) return { relative: true, target: posix.join(posix.dirname(importer), specifier) }
  return { relative: false, target: specifier.replace(/^[@~]\//, '') }
}

function specifierNames({ relative, target }, path) {
  const withoutExtension = path.replace(/\.[^./]+$/, '')
  if (relative) {
    const namesTheFile = target === path || target === withoutExtension
    const namesItsFolder = target === posix.dirname(withoutExtension) && MODULE_INDEX.has(posix.basename(withoutExtension))
    return namesTheFile || namesItsFolder
  }
  const moduleKey = moduleKeyOf(path, withoutExtension)
  return target === moduleKey || target.endsWith(`/${moduleKey}`)
}

function moduleKeyOf(path, withoutExtension) {
  const named = path.endsWith('.go') || MODULE_INDEX.has(posix.basename(withoutExtension)) ? posix.dirname(path) : withoutExtension
  return named.split('/').slice(-2).join('/')
}

function uniqueEdges(edges) {
  const seen = new Map(edges.map((edge) => [`${edge.from}\0${edge.to}`, edge]))
  return [...seen.values()].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to))
}

function dependenciesFirst(paths, edges) {
  const inGroup = new Set(paths)
  const waitingOn = new Map(paths.map((path) => [path, new Set()]))
  for (const { from, to } of edges) if (inGroup.has(from) && inGroup.has(to)) waitingOn.get(from).add(to)
  const order = []
  let ready = paths.filter((path) => waitingOn.get(path).size === 0).sort()
  while (ready.length) {
    const next = ready.shift()
    order.push(next)
    waitingOn.delete(next)
    for (const [path, waiting] of waitingOn) if (waiting.delete(next) && waiting.size === 0 && !ready.includes(path)) ready.push(path)
    ready.sort()
  }
  const inCycles = [...waitingOn.keys()].sort()
  return [...order, ...inCycles]
}

function changedFiles(root, base, head) {
  const range = `${base}...${head}`
  const statuses = nameStatus(git(root, ['diff', '--name-status', '-z', '-M', range]))
  const counts = numstat(git(root, ['diff', '--numstat', '-z', '-M', range]))
  return statuses.map((file) => ({ ...file, ...(counts.get(file.path) ?? { added: null, deleted: null }) }))
}

function nameStatus(output) {
  const fields = output.split('\0').filter(Boolean)
  const files = []
  for (let at = 0; at < fields.length; ) {
    const status = fields[at][0]
    if (status === 'R' || status === 'C') {
      files.push({ path: fields[at + 2], status, from: fields[at + 1] })
      at += 3
    } else {
      files.push({ path: fields[at + 1], status })
      at += 2
    }
  }
  return files
}

function numstat(output) {
  const fields = output.split('\0')
  const counts = new Map()
  const count = (value) => (value === '-' ? null : Number(value))
  for (let at = 0; at < fields.length; at += 1) {
    const match = fields[at].match(/^(\S+)\t(\S+)\t(.*)$/)
    if (!match) continue
    const [, added, deleted, path] = match
    if (path === '') {
      counts.set(fields[at + 2], { added: count(added), deleted: count(deleted) })
      at += 2
    } else {
      counts.set(path, { added: count(added), deleted: count(deleted) })
    }
  }
  return counts
}

function fileAt(root, head, path) {
  const result = spawnSync('git', ['show', `${head}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: MAX_READ_BYTES * 4 })
  if (result.status !== 0) return ''
  return result.stdout.length > MAX_READ_BYTES ? '' : result.stdout
}

function resolveRef(root, ref) {
  const result = spawnSync('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`the ref "${ref}" does not resolve to a commit in ${root}`)
}

function git(root, args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed in ${root}: ${result.stderr.trim()}`)
  return result.stdout
}

function parseArguments(argv) {
  const value = (flag) => {
    const at = argv.indexOf(flag)
    return at === -1 ? undefined : argv[at + 1]
  }
  const options = { base: value('--base'), head: value('--head'), root: value('--root') ?? process.cwd() }
  if (!options.base || !options.head) throw new Error('usage: change-map.mjs --base <ref> --head <ref> [--root <dir>]')
  return options
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(changeMap(parseArguments(process.argv.slice(2))), null, 2))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
