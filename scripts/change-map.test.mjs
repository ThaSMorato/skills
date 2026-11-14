import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { changeMap, classify, edgesBetween, readingOrder } from './change-map.mjs'

// A reviewer loses the most time on a pull request before reading a single line: which files changed,
// how they connect, and where to start. The list of changed files and the links between them are
// mechanical, so a script draws them, and a test makes sure no changed file is left off the map.

const script = join(dirname(fileURLToPath(import.meta.url)), 'change-map.mjs')
const aFile = (path, extra = {}) => ({ path, status: 'M', added: 3, deleted: 1, ...extra })

describe('classify', () => {
  test('a lockfile is only skimmed', () => {
    assert.deepEqual(classify(aFile('package-lock.json')), { kind: 'lock', skim: true, reason: 'lockfile' })
  })

  test('a generated file is only skimmed', () => {
    assert.deepEqual(classify(aFile('src/api/generated/client.ts')), { kind: 'generated', skim: true, reason: 'generated' })
  })

  test('a rename with no line changed is only skimmed', () => {
    const sut = aFile('src/billing/total.ts', { status: 'R', from: 'src/pricing/total.ts', added: 0, deleted: 0 })

    assert.deepEqual(classify(sut), { kind: 'source', skim: true, reason: 'pure rename' })
  })

  test('tests, migrations, docs and config are told apart from source', () => {
    const kinds = ['src/cart.test.ts', 'tests/test_cart.py', 'cart_test.go', 'db/migrations/0004_add_coupon.sql', 'docs/cart.md', '.github/workflows/ci.yml', 'src/cart.ts']
      .map((path) => classify(aFile(path)).kind)

    assert.deepEqual(kinds, ['test', 'test', 'test', 'schema', 'docs', 'config', 'source'])
  })
})

describe('edgesBetween', () => {
  test('a relative JavaScript import links the importer to the file it imports', () => {
    const sut = edgesBetween({
      'src/checkout/handler.ts': "import { total } from '../pricing/total'\n",
      'src/pricing/total.ts': 'export const total = 1\n',
    })

    assert.deepEqual(sut, [{ from: 'src/checkout/handler.ts', to: 'src/pricing/total.ts' }])
  })

  test('a relative import that spells the extension links too', () => {
    const sut = edgesBetween({
      'scripts/install.test.mjs': "import { install } from './install.mjs'\n",
      'scripts/install.mjs': 'export const install = 1\n',
    })

    assert.deepEqual(sut, [{ from: 'scripts/install.test.mjs', to: 'scripts/install.mjs' }])
  })

  test('a dotted Python import links to the module file', () => {
    const sut = edgesBetween({
      'app/checkout/views.py': 'from app.pricing.total import compute\n',
      'app/pricing/total.py': 'def compute(): pass\n',
    })

    assert.deepEqual(sut, [{ from: 'app/checkout/views.py', to: 'app/pricing/total.py' }])
  })

  test('a Go import of a package links to every changed file in its folder', () => {
    const sut = edgesBetween({
      'cmd/server/main.go': 'import (\n\t"example.com/shop/internal/pricing"\n)\n',
      'internal/pricing/total.go': 'package pricing\n',
      'internal/pricing/coupon.go': 'package pricing\n',
    })

    assert.deepEqual(sut, [
      { from: 'cmd/server/main.go', to: 'internal/pricing/coupon.go' },
      { from: 'cmd/server/main.go', to: 'internal/pricing/total.go' },
    ])
  })

  test('a name that only appears outside an import line is not a link', () => {
    const sut = edgesBetween({
      'src/checkout/handler.ts': '// the total comes from pricing/total\nexport const x = 1\n',
      'src/pricing/total.ts': 'export const total = 1\n',
    })

    assert.deepEqual(sut, [])
  })
})

describe('readingOrder', () => {
  test('a file comes after the files it depends on, the schema first, and tests and skimmed files last', () => {
    const files = [
      { path: 'src/checkout/handler.test.ts', kind: 'test', skim: false },
      { path: 'package-lock.json', kind: 'lock', skim: true },
      { path: 'src/checkout/handler.ts', kind: 'source', skim: false },
      { path: 'db/migrations/0004_add_coupon.sql', kind: 'schema', skim: false },
      { path: 'src/pricing/total.ts', kind: 'source', skim: false },
      { path: 'docs/checkout.md', kind: 'docs', skim: false },
    ]
    const edges = [
      { from: 'src/checkout/handler.ts', to: 'src/pricing/total.ts' },
      { from: 'src/checkout/handler.test.ts', to: 'src/checkout/handler.ts' },
    ]

    assert.deepEqual(readingOrder(files, edges), [
      'db/migrations/0004_add_coupon.sql',
      'src/pricing/total.ts',
      'src/checkout/handler.ts',
      'src/checkout/handler.test.ts',
      'docs/checkout.md',
      'package-lock.json',
    ])
  })

  test('two files that import each other are both placed, once each', () => {
    const files = [{ path: 'src/a.ts', kind: 'source', skim: false }, { path: 'src/b.ts', kind: 'source', skim: false }]
    const edges = [{ from: 'src/a.ts', to: 'src/b.ts' }, { from: 'src/b.ts', to: 'src/a.ts' }]

    assert.deepEqual([...readingOrder(files, edges)].sort(), ['src/a.ts', 'src/b.ts'])
  })
})

describe('changeMap over a real repository', () => {
  let repo
  const git = (...args) => {
    const result = spawnSync('git', ['-c', 'commit.gpgsign=false', ...args], { cwd: repo, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    return result.stdout
  }
  const write = (path, text) => {
    mkdirSync(join(repo, dirname(path)), { recursive: true })
    writeFileSync(join(repo, path), text)
  }

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), 'change-map-'))
    git('init', '-q', '-b', 'main')
    git('config', 'user.email', 'test@example.com')
    git('config', 'user.name', 'Test')
    write('src/pricing/total.ts', 'export const total = 1\n')
    write('src/legacy/old.ts', 'export const old = 1\n')
    git('add', '.')
    git('commit', '-q', '-m', 'base')
    git('switch', '-q', '-c', 'feature')
    write('src/pricing/total.ts', 'export const total = 2\nexport const tax = 0\n')
    write('src/checkout/handler.ts', "import { total } from '../pricing/total'\nexport const handle = () => total\n")
    write('src/checkout/handler.test.ts', "import { handle } from './handler'\n")
    write('package-lock.json', '{}\n')
    git('mv', 'src/legacy/old.ts', 'src/legacy/older.ts')
    git('add', '.')
    git('commit', '-q', '-m', 'feature')
  })

  afterEach(() => rmSync(repo, { recursive: true, force: true }))

  test('every file of the diff is on the map exactly once, in the files and in the order', () => {
    const sut = changeMap({ root: repo, base: 'main', head: 'feature' })
    const expected = ['package-lock.json', 'src/checkout/handler.test.ts', 'src/checkout/handler.ts', 'src/legacy/older.ts', 'src/pricing/total.ts']

    assert.deepEqual(
      { files: sut.files.map((file) => file.path).sort(), order: [...sut.order].sort() },
      { files: expected, order: expected },
    )
  })

  test('the map reads the head, not the working tree', () => {
    git('switch', '-q', 'main')

    const sut = changeMap({ root: repo, base: 'main', head: 'feature' })

    assert.deepEqual(sut.edges, [
      { from: 'src/checkout/handler.test.ts', to: 'src/checkout/handler.ts' },
      { from: 'src/checkout/handler.ts', to: 'src/pricing/total.ts' },
    ])
  })

  test('the command line prints the map as JSON, with the rename and where it came from', () => {
    const result = spawnSync('node', [script, '--base', 'main', '--head', 'feature', '--root', repo], { encoding: 'utf8' })
    const rename = JSON.parse(result.stdout).files.find((file) => file.path === 'src/legacy/older.ts')

    assert.deepEqual(
      { status: result.status, rename: { status: rename.status, from: rename.from, skim: rename.skim } },
      { status: 0, rename: { status: 'R', from: 'src/legacy/old.ts', skim: true } },
    )
  })

  test('a ref that does not resolve fails with the ref named', () => {
    const result = spawnSync('node', [script, '--base', 'main', '--head', 'nowhere', '--root', repo], { encoding: 'utf8' })

    assert.deepEqual({ status: result.status, names: result.stderr.includes('nowhere') }, { status: 1, names: true })
  })
})
