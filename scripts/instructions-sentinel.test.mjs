import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { checkInstructions, readSentinels, writeSentinels } from './instructions-sentinel.mjs'

// Whether a harness loads the project's instruction file, and follows it, is not something either
// harness reports. A harmless rule in each file asks every artifact to carry a value only that file
// gives; the artifacts then say, stage by stage, which file reached the agent and which did not.

const script = join(dirname(fileURLToPath(import.meta.url)), 'instructions-sentinel.mjs')

describe('writeSentinels', () => {
  let root
  const read = (file) => readFileSync(join(root, file), 'utf8')

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'sentinel-'))
  })

  afterEach(() => rmSync(root, { recursive: true, force: true }))

  test('adds the sentinel line to each root instruction file, keeping what the owner wrote', () => {
    writeFileSync(join(root, 'CLAUDE.md'), '# Project\n\nUse pnpm.\n')
    writeFileSync(join(root, 'AGENTS.md'), '# Project\n')

    const sut = writeSentinels({ root, token: '3f9a1c2e' })

    assert.deepEqual(
      { sut, claude: read('CLAUDE.md').startsWith('# Project\n\nUse pnpm.\n'), sentinels: readSentinels({ root }) },
      { sut: { written: ['CLAUDE.md', 'AGENTS.md'], kept: [], missing: [] }, claude: true, sentinels: { 'CLAUDE.md': 'CLAUDE.md:3f9a1c2e', 'AGENTS.md': 'AGENTS.md:3f9a1c2e' } },
    )
  })

  test('never creates an instruction file: a new CLAUDE.md would hide AGENTS.md from Claude Code', () => {
    writeFileSync(join(root, 'AGENTS.md'), '# Project\n')

    const sut = writeSentinels({ root, token: '3f9a1c2e' })

    assert.deepEqual({ sut, created: existsSync(join(root, 'CLAUDE.md')) }, { sut: { written: ['AGENTS.md'], kept: [], missing: ['CLAUDE.md'] }, created: false })
  })

  test('a file that already has a sentinel keeps its token, so the artifacts written before still match', () => {
    writeFileSync(join(root, 'AGENTS.md'), '# Project\n')
    writeSentinels({ root, token: 'aaaa1111' })

    const sut = writeSentinels({ root, token: 'bbbb2222' })

    assert.deepEqual({ sut, sentinels: readSentinels({ root }), lines: read('AGENTS.md').match(/Sentinel/g).length }, { sut: { written: [], kept: ['AGENTS.md'], missing: ['CLAUDE.md'] }, sentinels: { 'AGENTS.md': 'AGENTS.md:aaaa1111' }, lines: 1 })
  })

  test('the line says it changes nothing but the field, so no stage takes it for a rule about the work', () => {
    writeFileSync(join(root, 'AGENTS.md'), '# Project\n')

    writeSentinels({ root, token: '3f9a1c2e' })

    assert.match(read('AGENTS.md'), /`AGENTS\.md:3f9a1c2e`.*`instructions`.*It changes nothing else/)
  })
})

describe('checkInstructions', () => {
  const sentinels = { 'CLAUDE.md': 'CLAUDE.md:3f9a1c2e', 'AGENTS.md': 'AGENTS.md:3f9a1c2e' }

  test('an artifact carrying a file value followed that file', () => {
    assert.deepEqual(checkInstructions({ sentinels, values: ['AGENTS.md:3f9a1c2e'] }), { verdict: 'followed', followed: ['AGENTS.md'], stale: [] })
  })

  test('an empty list means the stage ran without the project instructions', () => {
    assert.deepEqual(checkInstructions({ sentinels, values: [] }), { verdict: 'none', followed: [], stale: [] })
  })

  test('a value no current file gives is stale: an old token, or one the model made up', () => {
    assert.deepEqual(checkInstructions({ sentinels, values: ['CLAUDE.md:00000000'] }), { verdict: 'stale', followed: [], stale: ['CLAUDE.md:00000000'] })
  })

  test('an artifact without the field predates it', () => {
    assert.deepEqual(checkInstructions({ sentinels, values: undefined }), { verdict: 'unknown', followed: [], stale: [] })
  })
})

describe('the command line', () => {
  let root

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'sentinel-cli-'))
  })

  afterEach(() => rmSync(root, { recursive: true, force: true }))

  test('write makes a fresh token and prints what it wrote', () => {
    writeFileSync(join(root, 'AGENTS.md'), '# Project\n')

    const run = spawnSync('node', [script, 'write', '--root', root], { encoding: 'utf8' })

    assert.deepEqual(
      { written: JSON.parse(run.stdout).written, fresh: /^AGENTS\.md:[0-9a-f]{8}$/.test(readSentinels({ root })['AGENTS.md']) },
      { written: ['AGENTS.md'], fresh: true },
    )
  })

  test('check reads the field of each artifact given and prints a verdict per path', () => {
    writeFileSync(join(root, 'AGENTS.md'), '# Project\n')
    writeSentinels({ root, token: '3f9a1c2e' })
    writeFileSync(join(root, 'review.md'), '---\nkind: review\nharness: codex\ninstructions: [AGENTS.md:3f9a1c2e]\n---\n')
    writeFileSync(join(root, 'old.md'), '---\nkind: review\nharness: codex\n---\n')

    const run = spawnSync('node', [script, 'check', '--root', root, join(root, 'review.md'), join(root, 'old.md')], { encoding: 'utf8' })

    assert.deepEqual(
      JSON.parse(run.stdout).map(({ verdict, harness }) => [verdict, harness]),
      [['followed', 'codex'], ['unknown', 'codex']],
    )
  })
})
