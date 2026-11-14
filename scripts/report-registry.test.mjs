import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { recordReport, listReports } from './report-registry.mjs'

// /tm-flow-report reads what several projects learned about the plugin. Each retro and meta-retro
// records itself in one registry outside any project, so the report finds them without being handed
// paths, and knows what each holds before opening it.

const metaRetro = ({ flow = 2 } = {}) => `---
kind: meta-retro
plugin_version: 0.7.0
model: claude-opus-5-5
harness: claude-code
session: 5f2c
analyzed_at: 2026-10-28
findings: {flow: ${flow}, repo-skill: 1, repo-code: 0}
---

# Meta-retro: session 5f2c
`

describe('report registry', () => {
  let home
  let repo
  const registry = () => join(home, '.thasmorato-skills', 'reports.json')
  const report = () => join(repo, 'docs', 'meta-retro', '2026-10-28-5f2c.md')

  beforeEach(() => {
    home = realpathSync(mkdtempSync(join(tmpdir(), 'report-registry-')))
    repo = join(home, 'shop')
    mkdirSync(join(repo, 'docs', 'meta-retro'), { recursive: true })
    spawnSync('git', ['init', '-q', '-b', 'main'], { cwd: repo })
    writeFileSync(report(), metaRetro())
  })

  afterEach(() => rmSync(home, { recursive: true, force: true }))

  test('a report is recorded with its repo, its file and the summary its frontmatter gives', () => {
    const sut = recordReport({ report: report(), registry: registry() })

    assert.deepEqual(sut, {
      repo,
      file: 'docs/meta-retro/2026-10-28-5f2c.md',
      kind: 'meta-retro',
      date: '2026-10-28',
      plugin_versions: ['0.7.0'],
      model: 'claude-opus-5-5',
      harness: 'claude-code',
      findings: { flow: 2, 'repo-skill': 1, 'repo-code': 0 },
    })
  })

  test('a retro is recorded with every plugin version it measured', () => {
    const retro = join(repo, 'docs', 'retro', 'ledger.md')
    mkdirSync(dirname(retro), { recursive: true })
    writeFileSync(retro, '---\nkind: retro\nscope: ledger\ndate: 2026-10-28\nplugin_versions: [0.6.7, 0.7.0]\nfindings: {flow: 1}\n---\n')

    assert.deepEqual(recordReport({ report: retro, registry: registry() }).plugin_versions, ['0.6.7', '0.7.0'])
  })

  test('the registry and its folder are created on the first record', () => {
    recordReport({ report: report(), registry: registry() })

    assert.equal(JSON.parse(readFileSync(registry(), 'utf8')).reports.length, 1)
  })

  test('recording the same report again updates its entry instead of adding one', () => {
    recordReport({ report: report(), registry: registry() })
    writeFileSync(report(), metaRetro({ flow: 5 }))

    recordReport({ report: report(), registry: registry() })

    assert.deepEqual(listReports({ registry: registry() }).reports.map((entry) => entry.findings.flow), [5])
  })

  test('a repo that moved is listed as not found, without failing the list', () => {
    recordReport({ report: report(), registry: registry() })
    renameSync(repo, join(home, 'shop-moved'))

    assert.equal(listReports({ registry: registry() }).reports[0].found, false)
  })

  test('a registry nobody wrote yet lists no report', () => {
    assert.deepEqual(listReports({ registry: registry() }), { registry: registry(), reports: [] })
  })

  test('a file that is not a retro or a meta-retro is refused, and nothing is written', () => {
    writeFileSync(report(), '---\nkind: review\n---\n')

    assert.throws(() => recordReport({ report: report(), registry: registry() }), /not a retro or a meta-retro/)
    assert.equal(existsSync(registry()), false)
  })

  test('a registry that is not valid JSON is an error that names it, never overwritten', () => {
    mkdirSync(join(home, '.thasmorato-skills'))
    writeFileSync(registry(), '{ broken')

    assert.throws(() => recordReport({ report: report(), registry: registry() }), /reports\.json.*not valid JSON/)
    assert.equal(readFileSync(registry(), 'utf8'), '{ broken')
  })
})
