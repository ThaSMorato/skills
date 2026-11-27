import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { FILE_BUDGET_BYTES, SECTION_BUDGET_BYTES, checkSizes } from './doc-size.mjs'

// A living document is amended by every effort and nothing ever shrank one: a PRD reached 1.33 MB and
// an HLD 878 KB, past what one read returns, and the writers told to read them whole failed or paid
// for all of it on every amendment. This check is the size budget a validation can fail on.

const script = join(dirname(fileURLToPath(import.meta.url)), 'doc-size.mjs')
const prose = (bytes) => `${'word '.repeat(Math.ceil(bytes / 5))}\n`

describe('checkSizes', () => {
  let root
  const put = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'doc-size-'))
  })

  afterEach(() => rmSync(root, { recursive: true, force: true }))

  test('a document inside both budgets is counted and not reported', () => {
    put('docs/product/prd.md', `# PRD\n\n## Goals\n${prose(2000)}\n## Requirements\n${prose(3000)}`)

    assert.deepEqual(checkSizes({ root }), { budgets: { file: FILE_BUDGET_BYTES, section: SECTION_BUDGET_BYTES }, checked: 1, over: [] })
  })

  test('a section over its budget is named with its heading and line, in a file that is itself small enough', () => {
    put('docs/architecture/hld.md', `# HLD\n\n## Context\n${prose(1000)}\n## Main components\n${prose(SECTION_BUDGET_BYTES + 500)}`)

    const [sut] = checkSizes({ root }).over

    assert.deepEqual(
      { file: sut.file, overFile: sut.over_file, sections: sut.sections.map(({ heading, line, over }) => [heading, line, over]) },
      { file: 'docs/architecture/hld.md', overFile: false, sections: [['Main components', 6, true]] },
    )
  })

  test('a file over its budget lists its three largest sections, so the writer sees what to move', () => {
    const section = (name, bytes) => `## ${name}\n${prose(bytes)}\n`
    put('docs/product/prd.md', `# PRD\n\n${section('Goals', 10_000)}${section('Requirements', 24_000)}${section('Scenarios', 20_000)}${section('Risks', 22_000)}${section('Retired', 23_000)}${section('Glossary', 12_000)}`)

    const [sut] = checkSizes({ root }).over

    assert.deepEqual({ overFile: sut.over_file, largest: sut.sections.map(({ heading }) => heading) }, { overFile: true, largest: ['Requirements', 'Retired', 'Risks'] })
  })

  test('a heading inside a code block does not start a section', () => {
    put('docs/features/ledger/fdd.md', `# FDD\n\n## Contracts\n\`\`\`markdown\n## Not a section\n\`\`\`\n${prose(SECTION_BUDGET_BYTES + 500)}`)

    assert.deepEqual(checkSizes({ root }).over[0].sections.map(({ heading }) => heading), ['Contracts'])
  })

  test('with no file named, it reads the living documents and leaves the records and the effort files alone', () => {
    const big = `# Big\n\n## Everything\n${prose(SECTION_BUDGET_BYTES + 500)}`
    for (const path of ['docs/product/prd.md', 'docs/architecture/hld.md', 'docs/features/ledger/fdd.md', 'docs/adr/0001-big.md', 'docs/retro/2026-11-01-ledger.md', '.scratch/effort/brief.md']) put(path, big)

    assert.deepEqual(checkSizes({ root }).over.map(({ file }) => file), ['docs/architecture/hld.md', 'docs/features/ledger/fdd.md', 'docs/product/prd.md'])
  })

  test('a file can be named, and one that does not exist fails by name', () => {
    put('docs/product/prd.md', `# PRD\n\n## Goals\n${prose(100)}`)

    assert.deepEqual(
      { named: checkSizes({ root, files: ['docs/product/prd.md'] }).checked, missing: (() => { try { checkSizes({ root, files: ['docs/product/nope.md'] }) } catch (error) { return error.message } })() },
      { named: 1, missing: 'docs/product/nope.md: no such file' },
    )
  })

  test('run as a command, it exits 1 when a document is over and 0 when none is', () => {
    put('docs/product/prd.md', `# PRD\n\n## Goals\n${prose(100)}`)
    const clean = spawnSync('node', [script, '--root', root], { encoding: 'utf8' })
    put('docs/architecture/hld.md', `# HLD\n\n## Main components\n${prose(SECTION_BUDGET_BYTES + 500)}`)
    const over = spawnSync('node', [script, '--root', root], { encoding: 'utf8' })

    assert.deepEqual({ clean: clean.status, over: over.status, names: JSON.parse(over.stdout).over.map(({ file }) => file) }, { clean: 0, over: 1, names: ['docs/architecture/hld.md'] })
  })
})
