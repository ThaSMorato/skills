import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { flowState, resolveTicket } from './flow-state.mjs'

// Where each ticket stands is in the frontmatter its stages wrote. Read mechanically, the matrix is
// the same for /tm-flow, /tm-retro and /tm-flow-report; read by a model out of prose, it drifts.

const sha256 = (text) => createHash('sha256').update(text).digest('hex')

describe('flowState and resolveTicket', () => {
  let parent
  let repo
  const git = (...args) => spawnSync('git', args, { cwd: repo, encoding: 'utf8' })
  const put = (path, text, root = repo) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  const ticket = (feature, slug) => put(`.scratch/${feature}/issues/${slug}.md`, `---\nkind: ticket\ntype: feature\ngear: small\nacs: 2\n---\n\n# ${slug.slice(0, 2)}: ${slug.slice(3)}\n\n## Metadata (required)\n- **Status:** ready\n`)
  const progress = (feature, slug, { status = 'in_progress', done = 1 } = {}, root = repo) =>
    put(`.scratch/${feature}/plans/${slug}/progress.md`, `---\nkind: progress\nslug: ${slug}\nstatus: ${status}\nsis_done: ${done}\nsis_total: 3\nescalations: 0\n---\n`, root)
  const ticketOf = (sut, feature, slug) => sut.features.find((entry) => entry.feature === feature).tickets.find((entry) => entry.slug === slug)
  const featureOf = (sut, feature) => sut.features.find((entry) => entry.feature === feature)

  beforeEach(() => {
    parent = realpathSync(mkdtempSync(join(tmpdir(), 'flow-state-')))
    repo = join(parent, 'shop')
    mkdirSync(repo)
    git('init', '-q', '-b', 'main')
    git('config', 'user.email', 'owner@example.com')
    git('config', 'user.name', 'Owner')
    git('config', 'commit.gpgsign', 'false')
    put('.gitignore', '.scratch\n')
    git('add', '.')
    git('commit', '-q', '-m', 'init')
  })

  afterEach(() => rmSync(parent, { recursive: true, force: true }))

  test('a ticket with only its issue file has every later cell empty', () => {
    ticket('ledger', '01-read-model')

    const sut = ticketOf(flowState({ cwd: repo }), 'ledger', '01-read-model')

    assert.deepEqual(
      { status: sut.status, design: sut.design, plan: sut.plan, validation: sut.validation, progress: sut.progress, review: sut.review, acceptance: sut.acceptance, worktree: sut.worktree },
      { status: 'ready', design: false, plan: null, validation: null, progress: null, review: null, acceptance: null, worktree: 'main' },
    )
  })

  test('the counts come from frontmatter as numbers and maps, never from the body', () => {
    ticket('ledger', '01-read-model')
    put('.scratch/ledger/reviews/01-read-model.md', '---\nkind: review\nfindings: 4\nby_severity: {critical: 0, high: 1, medium: 2, low: 1}\nlenses_run: [quality, tests]\n---\n\nfindings: 99\n')

    const sut = ticketOf(flowState({ cwd: repo }), 'ledger', '01-read-model')

    assert.deepEqual(
      { findings: sut.review.findings, severity: sut.review.by_severity, lenses: sut.review.lenses_run },
      { findings: 4, severity: { critical: 0, high: 1, medium: 2, low: 1 }, lenses: ['quality', 'tests'] },
    )
  })

  test('a validation of an older version of the plan is stale', () => {
    ticket('ledger', '01-read-model')
    put('.scratch/ledger/plans/01-read-model/plan.md', 'plan v1\n')
    put('.scratch/ledger/plans/01-read-model/validation.md', `---\nkind: validation\nstatus: clean\nplan_sha256: ${sha256('plan v1\n')}\n---\n`)
    put('.scratch/ledger/plans/01-read-model/plan.md', 'plan v2\n')

    const sut = ticketOf(flowState({ cwd: repo }), 'ledger', '01-read-model')

    assert.deepEqual({ status: sut.validation.status, stale: sut.validation.stale }, { status: 'clean', stale: true })
  })

  test('a feature whose tickets all completed, with no retro yet, is awaiting its retro', () => {
    ticket('ledger', '01-read-model')
    progress('ledger', '01-read-model', { status: 'completed', done: 3 })

    assert.equal(featureOf(flowState({ cwd: repo }), 'ledger').state, 'awaiting-retro')
  })

  test('a feature a retro covers is no longer awaiting one', () => {
    ticket('ledger', '01-read-model')
    progress('ledger', '01-read-model', { status: 'completed', done: 3 })
    put('docs/retro/ledger.md', '---\nkind: retro\nscope: ledger\n---\n')

    assert.deepEqual(
      { state: featureOf(flowState({ cwd: repo }), 'ledger').state, retro: featureOf(flowState({ cwd: repo }), 'ledger').retro },
      { state: 'retro done', retro: 'docs/retro/ledger.md' },
    )
  })

  test('a feature with one ticket still open is in progress', () => {
    ticket('ledger', '01-read-model')
    ticket('ledger', '02-export')
    progress('ledger', '01-read-model', { status: 'completed', done: 3 })

    assert.equal(featureOf(flowState({ cwd: repo }), 'ledger').state, 'in progress')
  })

  test('a ticket implemented in a worktree with a copy of .scratch is read from that worktree', () => {
    ticket('ledger', '02-export')
    const elsewhere = join(parent, 'shop-02-export')
    git('worktree', 'add', '-q', '-b', 'ledger/02-export', elsewhere, 'main')
    cpSync(join(repo, '.scratch'), join(elsewhere, '.scratch'), { recursive: true })
    progress('ledger', '02-export', { done: 2 }, elsewhere)

    const sut = ticketOf(flowState({ cwd: repo }), 'ledger', '02-export')

    assert.deepEqual({ worktree: sut.worktree, done: sut.progress.sis_done }, { worktree: elsewhere, done: 2 })
  })

  test('a loose slug resolves to the ticket it names', () => {
    ticket('ledger', '01-read-model')
    ticket('ledger', '02-export')

    assert.deepEqual(resolveTicket({ cwd: repo, text: 'export' }).map((match) => match.slug), ['02-export'])
  })

  test('a number two features share resolves to both, so the caller asks', () => {
    ticket('ledger', '01-read-model')
    ticket('catalog', '01-list-products')

    assert.deepEqual(resolveTicket({ cwd: repo, text: '01' }).map((match) => `${match.feature}/${match.slug}`), ['catalog/01-list-products', 'ledger/01-read-model'])
  })

  test('an exact slug wins over a partial match', () => {
    ticket('ledger', '02-export')
    ticket('ledger', '03-export-csv')

    assert.deepEqual(resolveTicket({ cwd: repo, text: '02-export' }).map((match) => match.slug), ['02-export'])
  })
})
