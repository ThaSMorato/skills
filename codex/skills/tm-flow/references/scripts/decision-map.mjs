#!/usr/bin/env node
// Reads what /tm-decision-map and /tm-flow need from the disk, mechanically.
// `frontier`: the open decisions of an effort's map that no other open decision blocks, each with its
// type, which names the stage that resolves it. A blocker that is no longer an open row was decided.
// `elsewhere`: the decisions still open in the documents they bind (the items under an `Open questions`
// heading of the effort's own documents and of `docs/`, and every `> Needs Input:` line), with file
// and line. The map points at them; it does not copy them, so each decision lives in one place.
// `decided`: what was settled outside the map, in the same places (every `> Decided:` marker, and
// every ADR with its state), for the map to record and to review its fog against.
// Usage: node decision-map.mjs frontier|elsewhere|decided --effort <effort> [--root <dir>]   (prints JSON)
// No dependencies beyond the Node standard library.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const NEEDS_INPUT = /^>\s*Needs Input:\s*(.+)$/
const DECIDED = /^>\s*Decided(?: \([^)]*\))?:\s*(.+)$/
const ADR_FOLDER = 'docs/adr/'
const OPEN_QUESTIONS = /^#{2,3} .*Open questions/
const LIST_ITEM = /^\s*(?:[-*]|\d+\.)\s+(?:\[[ x]\]\s+)?(.+)$/
const NOT_A_SOURCE = ['decision-map.md']
const SKIPPED_FOLDERS = ['questionnaires']

export function frontier(mapText) {
  const rows = tableUnder(mapText, 'Open decisions')
  const openIds = new Set(rows.map((row) => row.id))
  return rows
    .filter((row) => !idsIn(row['blocked by']).some((id) => openIds.has(id) && id !== row.id))
    .map(({ id, decision, type }) => ({ id, decision, type }))
}

export function openElsewhere({ root, effort }) {
  return sourcesOf(root, effort).flatMap((file) => openIn(file, readFileSync(join(root, file), 'utf8')))
}

export function decidedElsewhere({ root, effort }) {
  return sourcesOf(root, effort)
    .flatMap((file) => {
      const text = readFileSync(join(root, file), 'utf8')
      const markers = linesOutsideComments(text).flatMap(({ line, number }) => {
        const decided = line.match(DECIDED)?.[1]
        return decided ? [{ file, line: number, text: decided.trim() }] : []
      })
      return file.startsWith(ADR_FOLDER) ? [...markers, adrOf(file, text)].filter(Boolean) : markers
    })
}

function sourcesOf(root, effort) {
  return [...markdownUnder(root, join('.scratch', effort)), ...markdownUnder(root, 'docs')]
}

function adrOf(file, text) {
  const title = linesOutsideComments(text).find(({ line }) => /^# /.test(line))
  if (!title) return null
  const state = text.match(/^state:\s*(\S+)/m)?.[1]
  return { file, line: title.number, text: `${title.line.slice(2).trim()}${state ? ` (${state})` : ''}` }
}

function linesOutsideComments(text) {
  let inComment = false
  return text.split('\n').flatMap((line, index) => {
    if (line.includes('<!--')) inComment = true
    const commented = inComment
    if (line.includes('-->')) inComment = false
    return commented ? [] : [{ line, number: index + 1 }]
  })
}

function openIn(file, text) {
  const found = []
  let underOpenQuestions = false
  for (const { line, number } of linesOutsideComments(text)) {
    if (/^#{1,6} /.test(line)) underOpenQuestions = OPEN_QUESTIONS.test(line)
    const needsInput = line.match(NEEDS_INPUT)?.[1]
    const item = underOpenQuestions ? line.match(LIST_ITEM)?.[1] : undefined
    const open = needsInput ?? item
    if (open) found.push({ file, line: number, text: open.trim() })
  }
  return found
}

function markdownUnder(root, folder) {
  if (!existsSync(join(root, folder))) return []
  return readdirSync(join(root, folder), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && !NOT_A_SOURCE.includes(entry.name))
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .filter((path) => !path.split('/').some((segment) => SKIPPED_FOLDERS.includes(segment)))
    .sort()
}

// The rows of the first table under a `## <heading>`, keyed by the header cells in lower case.
function tableUnder(text, heading) {
  const lines = text.split('\n')
  const start = lines.findIndex((line) => new RegExp(`^## ${heading}\\b`).test(line))
  if (start === -1) return []
  const table = []
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break
    if (line.trim().startsWith('|')) table.push(line)
    else if (table.length) break
  }
  const [header, , ...body] = table.map(cells)
  if (!header) return []
  return body.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(header.map((name, index) => [name.toLowerCase(), row[index] ?? ''])))
}

function cells(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())
}

function idsIn(text = '') {
  return text.match(/D-\d+/g) ?? []
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [command] = process.argv.slice(2)
  const option = (name) => {
    const at = process.argv.indexOf(name)
    return at === -1 ? undefined : process.argv[at + 1]
  }
  const root = option('--root') ?? process.cwd()
  const effort = option('--effort')
  try {
    if (!effort || !['frontier', 'elsewhere', 'decided'].includes(command)) throw new Error('usage: decision-map.mjs frontier|elsewhere|decided --effort <effort> [--root <dir>]')
    const elsewhere = openElsewhere({ root, effort })
    if (command === 'elsewhere') console.log(JSON.stringify(elsewhere, null, 2))
    else if (command === 'decided') console.log(JSON.stringify(decidedElsewhere({ root, effort }), null, 2))
    else {
      const map = join('.scratch', effort, 'decision-map.md')
      if (!existsSync(join(root, map))) throw new Error(`${map} does not exist; /tm-decision-map ${effort} starts it`)
      console.log(JSON.stringify({ map, frontier: frontier(readFileSync(join(root, map), 'utf8')), elsewhere }, null, 2))
    }
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
