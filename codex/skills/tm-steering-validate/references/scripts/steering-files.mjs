#!/usr/bin/env node
// Finds every file that steers an agent in this repo (CLAUDE.md and AGENTS.md at any level,
// path-scoped rules under .claude/rules/, the repo's skills and guides, the guidelines router) and
// what in them is mechanically wrong: a referenced path that does not exist (`stale`), and a rule
// whose paths match no file yet (`unmatched`, which may be for files still to come). Whether two of
// them contradict each other is a judgement, left to /tm-steering-validate.
// Usage: node steering-files.mjs [--root <dir>]   (prints JSON)
// No dependencies beyond the Node standard library.

import { existsSync, globSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const SKIPPED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'vendor', 'coverage', '.scratch', '.next', 'target'])
const INSTRUCTION_FILES = { 'CLAUDE.md': 'claude-md', 'CLAUDE.local.md': 'claude-md', 'AGENTS.md': 'agents-md' }
const INLINE_CODE = /`([^`\n]+)`/g
const NOT_A_PATH = /[\s<>*{}$()|:'"]|^https?:|^-/
const LINE_SUFFIX = /:\d+(-\d+)?$/

export function readSteering({ root }) {
  const files = walk(root, root).map((path) => describe(root, path)).filter(Boolean).sort((a, b) => (a.path < b.path ? -1 : 1))
  return {
    root,
    files,
    stale: files.flatMap((file) => staleReferences(root, file.path)),
    unmatched: files.filter((file) => file.kind === 'rule' && file.paths.length && !file.paths.some((pattern) => matchesAny(root, pattern))).map(({ path, paths }) => ({ file: path, paths })),
  }
}

function walk(root, dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) ? [] : walk(root, path)
    return entry.isFile() && entry.name.endsWith('.md') ? [relative(root, path)] : []
  })
}

function describe(root, path) {
  const name = path.split('/').at(-1)
  if (INSTRUCTION_FILES[name]) return { path, kind: INSTRUCTION_FILES[name] }
  if (/^\.claude\/rules\/.+\.md$/.test(path)) return { path, kind: 'rule', paths: rulePaths(readFileSync(join(root, path), 'utf8')) }
  if (/^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(path)) return { path, kind: 'skill' }
  if (path === 'docs/guidelines.md') return { path, kind: 'guidelines' }
  return null
}

function rulePaths(text) {
  const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const inline = block.match(/^paths:\s*\[(.*)\]\s*$/m)
  if (inline) return inline[1].split(',').map(unquote).filter(Boolean)
  const list = block.match(/^paths:\s*\n((?:[ \t]+-[ \t].*(?:\n|$))+)/m)
  if (list) return list[1].split('\n').map((line) => unquote(line.replace(/^\s*-\s*/, ''))).filter(Boolean)
  const single = block.match(/^paths:\s*(\S.*)$/m)
  return single ? [unquote(single[1])] : []
}

function unquote(value) {
  return value.trim().replace(/^(['"])(.*)\1$/, '$2')
}

// Only a token with a slash is read as a path: a bare word in backticks is as often a command or a
// name as a file, and calling it stale would be noise.
function staleReferences(root, file) {
  let fenced = false
  return readFileSync(join(root, file), 'utf8')
    .split('\n')
    .flatMap((text, index) => {
      if (/^\s*(```|~~~)/.test(text)) fenced = !fenced
      if (fenced) return []
      return [...text.matchAll(INLINE_CODE)]
        .map(([, token]) => token.replace(LINE_SUFFIX, ''))
        .filter((token) => token.includes('/') && !NOT_A_PATH.test(token))
        .filter((token) => !existsSync(join(root, token)) && !existsSync(join(root, dirname(file), token)))
        .map((reference) => ({ file, line: index + 1, reference }))
    })
}

function matchesAny(root, pattern) {
  return globSync(pattern, { cwd: root }).some((path) => !path.split('/').some((part) => SKIPPED_DIRS.has(part)))
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const at = process.argv.indexOf('--root')
  try {
    console.log(JSON.stringify(readSteering({ root: at === -1 ? process.cwd() : process.argv[at + 1] }), null, 2))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
