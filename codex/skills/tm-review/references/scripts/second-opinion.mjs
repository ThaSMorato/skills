#!/usr/bin/env node
// Says whether a diff gets a second opinion in the other harness: always when it touches a risk path,
// and when it is 25 changed lines or more; a smaller diff outside every risk path skips it. The risk
// paths are the defaults below plus the globs the project lists under `Risk paths` in its guidelines.
// A default matches a path segment by its stem, so `author.ts` counts as auth: a second review asked
// for by mistake costs minutes, one skipped by mistake can ship.
// Usage: node second-opinion.mjs --diff <file> [--guidelines docs/guidelines.md]   (prints JSON)
// No dependencies beyond the Node standard library.

import { existsSync, readFileSync } from 'node:fs'

const SMALL_DIFF_LINES = 25
const DEFAULT_RISK_SEGMENT = /^[^/]*(auth|billing|migrat|infra)[^/]*$/i
const DEFAULT_RISK_EXTENSION = /\.sql$/i
const FILE_HEADER = /^diff --git a\/(.+) b\/(.+)$/
const RISK_SECTION = /^## (?:\d+\.\s*)?Risk paths\b/

export function secondOpinion({ diff, riskPaths = [] }) {
  const { files, changedLines } = readDiff(diff)
  const projectRisk = riskPaths.map(globToRegExp)
  const riskFiles = files.filter((path) => isDefaultRisk(path) || projectRisk.some((pattern) => pattern.test(path)))
  const reasons = [
    ...(riskFiles.length ? [`touches a risk path: ${riskFiles.join(', ')}`] : []),
    ...(changedLines >= SMALL_DIFF_LINES ? [`${changedLines} changed lines, ${SMALL_DIFF_LINES} or more`] : []),
  ]
  const suggest = reasons.length > 0
  return {
    changed_lines: changedLines,
    files,
    risk_files: riskFiles,
    suggest,
    reasons: suggest ? reasons : [`${changedLines} changed lines, under ${SMALL_DIFF_LINES}, and no risk path`],
  }
}

export function readRiskPaths(guidelines) {
  const lines = guidelines.split('\n')
  const start = lines.findIndex((line) => RISK_SECTION.test(line))
  if (start === -1) return []
  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '))
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .map((line) => line.match(/^\s*-\s*`([^`]+)`/)?.[1])
    .filter(Boolean)
}

// Both sides of each file header (a rename touches the old path too), and every added or removed line
// inside a hunk; the `---`/`+++` headers sit before the first hunk, so they are never counted.
function readDiff(diff) {
  const files = []
  let changedLines = 0
  let inHunk = false
  for (const line of diff.split('\n')) {
    const header = line.match(FILE_HEADER)
    if (header) {
      for (const path of header.slice(1)) if (!files.includes(path)) files.push(path)
      inHunk = false
    } else if (line.startsWith('@@')) inHunk = true
    else if (inHunk && (line.startsWith('+') || line.startsWith('-'))) changedLines += 1
  }
  return { files, changedLines }
}

function isDefaultRisk(path) {
  return DEFAULT_RISK_EXTENSION.test(path) || path.split('/').some((segment) => DEFAULT_RISK_SEGMENT.test(segment))
}

function globToRegExp(glob) {
  const pattern = (glob.endsWith('/') ? `${glob}**` : glob)
    .split(/(\*\*\/?|\*|\?)/)
    .map((part) => ({ '**/': '(?:.*/)?', '**': '.*', '*': '[^/]*', '?': '[^/]' })[part] ?? part.replace(/[.+^${}()|[\]\\]/g, '\\$&'))
    .join('')
  return new RegExp(`^${pattern}$`)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const option = (name) => {
    const at = process.argv.indexOf(name)
    return at === -1 ? undefined : process.argv[at + 1]
  }
  try {
    const diffPath = option('--diff')
    if (!diffPath) throw new Error('usage: second-opinion.mjs --diff <file> [--guidelines docs/guidelines.md]')
    const guidelines = option('--guidelines')
    const riskPaths = guidelines && existsSync(guidelines) ? readRiskPaths(readFileSync(guidelines, 'utf8')) : []
    console.log(JSON.stringify(secondOpinion({ diff: readFileSync(diffPath, 'utf8'), riskPaths }), null, 2))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
