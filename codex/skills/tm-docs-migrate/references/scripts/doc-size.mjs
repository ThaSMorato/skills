#!/usr/bin/env node
// Says which living documents, and which of their sections, have outgrown their reader. A writer
// amends a living document by reading its outline and the sections an effort touches, so a section
// has to come back in one read, and a file has to stay small enough for its outline to say where
// things are. Every effort adds and none removes, so without a budget a validation can fail on, the
// documents only grow. /tm-doc-validate runs this and reports each entry as a `DS` finding.
// Usage: node doc-size.mjs [--root <dir>] [<file>...]   (prints JSON; exits 1 when anything is over)
// With no file, it reads every Markdown file under the living folders of <root>.
// No dependencies beyond the Node standard library.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// One read returns about 25,000 tokens, close to 100 KB of prose: past that a file cannot be read whole.
export const FILE_BUDGET_BYTES = 100_000
// A section is read in one call beside the others an amendment touches, so it gets a quarter of that.
export const SECTION_BUDGET_BYTES = 25_000

const LIVING_FOLDERS = ['docs/product', 'docs/architecture', 'docs/features']
const SECTION_HEADING = /^## +(.+?)\s*$/
const CODE_FENCE = /^\s*(`{3,}|~{3,})(.*)$/
const LARGEST_SHOWN = 3

export function checkSizes({ root, files }) {
  const targets = files?.length ? files.map((file) => existing(root, file)) : LIVING_FOLDERS.flatMap((folder) => markdownUnder(root, folder)).sort()
  const over = targets.map((file) => ({ file, ...measure(readFileSync(join(root, file), 'utf8')) })).filter((document) => document.over_file || document.sections.length)
  return { budgets: { file: FILE_BUDGET_BYTES, section: SECTION_BUDGET_BYTES }, checked: targets.length, over }
}

// A document over the file budget shows its largest sections, the candidates to move out; one under
// it shows only the sections over their own budget.
function measure(text) {
  const bytes = Buffer.byteLength(text)
  const sections = sectionsOf(text).map((section) => ({ ...section, over: section.bytes > SECTION_BUDGET_BYTES }))
  const overFile = bytes > FILE_BUDGET_BYTES
  const bySize = [...sections].sort((a, b) => b.bytes - a.bytes)
  const shown = overFile ? bySize.filter((section, index) => section.over || index < LARGEST_SHOWN) : bySize.filter((section) => section.over)
  return { bytes, over_file: overFile, sections: shown }
}

function sectionsOf(text) {
  const sections = []
  let openFence = null
  text.split('\n').forEach((line, index) => {
    openFence = fenceAfter(openFence, line)
    const heading = openFence ? null : line.match(SECTION_HEADING)?.[1]
    if (heading) sections.push({ heading, line: index + 1, bytes: 0 })
    if (sections.length) sections.at(-1).bytes += Buffer.byteLength(line) + 1
  })
  return sections
}

// The fence a line leaves open. A code block closes only on a fence of the character that opened it,
// at least as long, with nothing after it: a shorter or different fence inside is the block's text.
function fenceAfter(openFence, line) {
  const [, fence, rest] = line.match(CODE_FENCE) ?? []
  if (!fence) return openFence
  if (!openFence) return fence
  const closes = fence[0] === openFence[0] && fence.length >= openFence.length && rest.trim() === ''
  return closes ? null : openFence
}

function existing(root, file) {
  if (!existsSync(join(root, file))) throw new Error(`${file}: no such file`)
  return file
}

function markdownUnder(root, folder) {
  if (!existsSync(join(root, folder))) return []
  return readdirSync(join(root, folder), { recursive: true })
    .filter((path) => path.endsWith('.md'))
    .map((path) => join(folder, path))
}

function parseArgs(argv) {
  const at = argv.indexOf('--root')
  if (at !== -1 && !argv[at + 1]) throw new Error('--root needs a directory after it')
  return { root: at === -1 ? process.cwd() : argv[at + 1], files: argv.filter((arg, index) => !arg.startsWith('--') && (at === -1 || index !== at + 1)) }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const result = checkSizes(parseArgs(process.argv.slice(2)))
    console.log(JSON.stringify(result, null, 2))
    process.exit(result.over.length ? 1 : 0)
  } catch (error) {
    console.error(error.message)
    process.exit(2)
  }
}
