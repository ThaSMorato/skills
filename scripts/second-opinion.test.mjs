import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readRiskPaths, secondOpinion } from './second-opinion.mjs'

// A second review in the other harness costs time and quota, and earns it where a miss is expensive.
// It is skipped only on a small diff that touches no risk path; counting the lines and matching the
// paths is mechanical, so a script does it instead of the model reading the diff by eye.

const script = join(dirname(fileURLToPath(import.meta.url)), 'second-opinion.mjs')

function aDiff(files) {
  return files
    .map(({ path, added = 0, removed = 0 }) =>
      [
        `diff --git a/${path} b/${path}`,
        'index 1111111..2222222 100644',
        `--- a/${path}`,
        `+++ b/${path}`,
        `@@ -1,${removed} +1,${added} @@`,
        ...Array.from({ length: removed }, (_, index) => `-old line ${index}`),
        ...Array.from({ length: added }, (_, index) => `+new line ${index}`),
      ].join('\n'),
    )
    .join('\n')
}

describe('secondOpinion', () => {
  test('a small diff outside every risk path skips the second opinion, and says why', () => {
    const sut = secondOpinion({ diff: aDiff([{ path: 'src/cart/total.ts', added: 6, removed: 4 }]) })

    assert.deepEqual(
      { changed: sut.changed_lines, suggest: sut.suggest, reasons: sut.reasons },
      { changed: 10, suggest: false, reasons: ['10 changed lines, under 25, and no risk path'] },
    )
  })

  test('a diff of 25 changed lines or more gets the second opinion', () => {
    const sut = secondOpinion({ diff: aDiff([{ path: 'src/a.ts', added: 20 }, { path: 'src/b.ts', removed: 5 }]) })

    assert.deepEqual({ suggest: sut.suggest, reasons: sut.reasons }, { suggest: true, reasons: ['25 changed lines, 25 or more'] })
  })

  test('one line in a default risk path gets the second opinion', () => {
    const risky = ['src/auth/session.ts', 'app/billing/invoice.rb', 'db/migrations/0003_add.rb', 'infra/main.tf', 'queries/report.sql', 'src/Authentication.ts']

    const sut = risky.map((path) => secondOpinion({ diff: aDiff([{ path, added: 1 }]) }))

    assert.deepEqual(sut.map(({ suggest, risk_files }) => [suggest, risk_files]), risky.map((path) => [true, [path]]))
  })

  test('a risk path is named in the reason, with every file that touched one', () => {
    const sut = secondOpinion({ diff: aDiff([{ path: 'src/auth/login.ts', added: 1 }, { path: 'db/migrate/001.rb', added: 1 }, { path: 'README.md', added: 1 }]) })

    assert.deepEqual(sut.reasons, ['touches a risk path: src/auth/login.ts, db/migrate/001.rb'])
  })

  test('the project adds its own risk paths as globs', () => {
    const sut = secondOpinion({ diff: aDiff([{ path: 'src/payments/charge.ts', added: 2 }]), riskPaths: ['src/payments/**'] })

    assert.deepEqual(sut.risk_files, ['src/payments/charge.ts'])
  })

  test('a removed line that begins with two dashes is counted, not taken for a header', () => {
    const diff = ['diff --git a/x.txt b/x.txt', '--- a/x.txt', '+++ b/x.txt', '@@ -1 +1 @@', '--- a comment', '+-- a comment'].join('\n')

    assert.equal(secondOpinion({ diff }).changed_lines, 2)
  })

  test('the file names come from the diff headers, both sides of a rename', () => {
    const diff = ['diff --git a/src/auth/old.ts b/src/session/new.ts', 'similarity index 90%', 'rename from src/auth/old.ts', 'rename to src/session/new.ts'].join('\n')

    assert.deepEqual(secondOpinion({ diff }).risk_files, ['src/auth/old.ts'])
  })
})

describe('readRiskPaths', () => {
  test('reads the globs listed under the Risk paths section of the guidelines', () => {
    const guidelines = ['# Engineering Guidelines', '', '## 9. Risk paths', '> what a second review never skips', '', '- `src/payments/**`', '- `config/secrets.*`: the encrypted credentials', '', '## 10. Checklist', '- `not/this/**`'].join('\n')

    assert.deepEqual(readRiskPaths(guidelines), ['src/payments/**', 'config/secrets.*'])
  })

  test('guidelines without the section add nothing', () => {
    assert.deepEqual(readRiskPaths('# Engineering Guidelines\n\n## 1. Project stack\n- `x/**`\n'), [])
  })
})

describe('the command line', () => {
  let dir

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'second-opinion-'))
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  test('reads the diff file and the project guidelines, and prints JSON', () => {
    writeFileSync(join(dir, 'diff.patch'), aDiff([{ path: 'lib/ledger/post.ts', added: 3 }]))
    writeFileSync(join(dir, 'guidelines.md'), '## 9. Risk paths\n- `lib/ledger/**`\n')

    const run = spawnSync('node', [script, '--diff', join(dir, 'diff.patch'), '--guidelines', join(dir, 'guidelines.md')], { encoding: 'utf8' })

    assert.deepEqual(JSON.parse(run.stdout).risk_files, ['lib/ledger/post.ts'])
  })

  test('a project with no guidelines file uses the defaults', () => {
    writeFileSync(join(dir, 'diff.patch'), aDiff([{ path: 'lib/x.ts', added: 3 }]))

    const run = spawnSync('node', [script, '--diff', join(dir, 'diff.patch'), '--guidelines', join(dir, 'missing.md')], { encoding: 'utf8' })

    assert.deepEqual({ status: run.status, suggest: JSON.parse(run.stdout).suggest }, { status: 0, suggest: false })
  })
})
