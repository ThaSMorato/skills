import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { MEASURED_FIELDS, measure, renderMeasurements } from './retro-measure.mjs'

// The retro's numbers were summed by the model from raw JSON: about fifty fields, grouped four ways.
// A number added up in prose looks exactly like a measured one. The script sums them, from one list
// of fields, and prints the Measurements section; the model pastes it.

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const frontmatter = (fields) => `---\n${Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join('\n')}\n---\n`

describe('measure', () => {
  let parent
  let repo
  const git = (...args) => spawnSync('git', args, { cwd: repo, encoding: 'utf8' })
  const put = (path, text) => {
    mkdirSync(dirname(join(repo, path)), { recursive: true })
    writeFileSync(join(repo, path), text)
  }
  const artifact = (path, fields) => put(path, frontmatter(fields))
  const ticket = (feature, slug, fields = {}) =>
    put(`.scratch/${feature}/issues/${slug}.md`, `${frontmatter({ kind: 'ticket', type: 'behavioral', gear: 'small', acs: 2, ...fields })}\n# ${slug.slice(0, 2)}: ${slug.slice(3)}\n`)
  const progress = (feature, slug, fields = {}) =>
    artifact(`.scratch/${feature}/plans/${slug}/progress.md`, {
      kind: 'progress', plugin_version: '0.7.1', model: 'fable', harness: 'claude-code', effort: 'high', status: 'completed', sis_done: 3, sis_total: 3, escalations: 0, unverified: 0, failed_deliverables: 0, ...fields,
    })
  const plan = (feature, slug, fields = {}) => artifact(`.scratch/${feature}/plans/${slug}/plan.md`, { kind: 'plan', plugin_version: '0.7.1', sis_planned: 3, revision: 1, ...fields })
  const review = (feature, slug, fields = {}, suffix = '') =>
    artifact(`.scratch/${feature}/reviews/${slug}${suffix}.md`, {
      kind: 'review', plugin_version: '0.7.1', model: 'fable', harness: 'claude-code', findings: 4, by_severity: '{critical: 0, high: 1, medium: 2, low: 1}', by_lens: '{quality: 3, tests: 1}', verdicts: '{confirmed: 3, pre-existing: 1}', refuted_by_lens: '{quality: 1}', ...fields,
    })
  const finished = (feature, slug, fields = {}) => {
    ticket(feature, slug)
    plan(feature, slug)
    progress(feature, slug, fields)
  }
  const rowOf = (sut, id) => sut.tickets.find((row) => row.ticket === id)

  beforeEach(() => {
    parent = realpathSync(mkdtempSync(join(tmpdir(), 'retro-measure-')))
    repo = join(parent, 'shop')
    mkdirSync(repo)
    git('init', '-q', '-b', 'main')
  })

  afterEach(() => rmSync(parent, { recursive: true, force: true }))

  test('every finished ticket in scope is a row read from frontmatter, and an unfinished one is left out by name', () => {
    finished('ledger', '01-read-model', { escalations: 2 })
    ticket('ledger', '02-export')
    progress('ledger', '02-export', { status: 'in_progress' })

    const sut = measure({ cwd: repo, scope: ['ledger'] })

    assert.deepEqual(
      { rows: sut.tickets.map((row) => [row.ticket, row.gear, row.acs, row.sis_planned, row.sis_done, row.escalations]), leftOut: sut.left_out },
      { rows: [['ledger/01-read-model', 'small', 2, 3, 3, 2]], leftOut: [{ ticket: 'ledger/02-export', status: 'in_progress' }] },
    )
  })

  test('the retro frontmatter names the versions measured and the features and tickets covered', () => {
    finished('ledger', '01-read-model')
    finished('ledger', '02-export', { plugin_version: '0.7.0' })
    finished('catalog', '01-list-products')

    const sut = measure({ cwd: repo, scope: ['ledger'] })

    assert.deepEqual(sut.frontmatter, { plugin_versions: ['0.7.0', '0.7.1'], features: ['ledger'], tickets: ['ledger/01-read-model', 'ledger/02-export'] })
  })

  test('a selector can name one ticket, and with none every feature is measured', () => {
    finished('ledger', '01-read-model')
    finished('ledger', '02-export')
    finished('catalog', '01-list-products')

    assert.deepEqual(
      { one: measure({ cwd: repo, scope: ['ledger/02-export'] }).frontmatter.tickets, all: measure({ cwd: repo, scope: [] }).frontmatter.features },
      { one: ['ledger/02-export'], all: ['catalog', 'ledger'] },
    )
  })

  test('a selector that names nothing fails with the features that exist', () => {
    finished('ledger', '01-read-model')

    assert.throws(() => measure({ cwd: repo, scope: ['billing'] }), /billing: no feature or ticket.*ledger/)
  })

  test('two plugin versions are two populations, never one sum', () => {
    finished('ledger', '01-read-model', { escalations: 2 })
    finished('ledger', '02-export', { escalations: 1 })
    finished('ledger', '03-import', { plugin_version: '0.7.0', escalations: 5 })

    const sut = measure({ cwd: repo, scope: [] })

    assert.deepEqual(
      sut.by_plugin_version.map((group) => [group.plugin_version, group.tickets, group.escalations]),
      [['0.7.0', 1, 5], ['0.7.1', 2, 3]],
    )
  })

  test('the totals are also grouped by who did the work and by gear, with medians and slices per criterion', () => {
    finished('ledger', '01-read-model')
    finished('ledger', '02-export', { model: 'gpt', harness: 'codex' })
    ticket('ledger', '02-export', { gear: 'full', acs: 6 })
    plan('ledger', '02-export', { sis_planned: 9 })

    const sut = measure({ cwd: repo, scope: [] })

    assert.deepEqual(
      {
        authors: sut.by_author.map((group) => [group.model, group.harness, group.tickets]),
        gears: sut.by_gear.map((group) => [group.gear, group.median_acs, group.sis_per_ac]),
      },
      { authors: [['fable', 'claude-code', 1], ['gpt', 'codex', 1]], gears: [['full', 6, 1.5], ['small', 2, 1.5]] },
    )
  })

  test('a review is read against the pair it closes, the second opinion as a pair of its own', () => {
    finished('ledger', '01-read-model')
    review('ledger', '01-read-model')
    review('ledger', '01-read-model', { model: 'gpt', harness: 'codex', opinion: 'second', findings: 2, not_in_first: 1, refuted_by_lens: '{}' }, '.second-opinion')

    const sut = measure({ cwd: repo, scope: [] })

    assert.deepEqual(
      sut.reviews.map((pair) => [pair.author, pair.reviewer, pair.opinion, pair.findings, pair.refuted, pair.not_in_first]),
      [['fable · claude-code', 'fable · claude-code', 'first', 4, 1, 0], ['fable · claude-code', 'gpt · codex', 'second', 2, 0, 1]],
    )
  })

  test('each lens shows what it raised, what the verifier refuted, and its precision', () => {
    finished('ledger', '01-read-model')
    review('ledger', '01-read-model')
    finished('ledger', '02-export')
    review('ledger', '02-export', { by_lens: '{quality: 1, security: 2}', refuted_by_lens: '{security: 2}' })

    const sut = measure({ cwd: repo, scope: [] })

    assert.deepEqual(
      sut.lenses.map((lens) => [lens.plugin_version, lens.lens, lens.raised, lens.refuted, lens.precision]),
      [['0.7.1', 'quality', 4, 1, '75%'], ['0.7.1', 'security', 2, 2, '0%'], ['0.7.1', 'tests', 1, 0, '100%']],
    )
  })

  test('per artifact and version, numbers are summed with their median, maps key by key, and words tallied', () => {
    finished('ledger', '01-read-model')
    finished('ledger', '02-export')
    artifact('.scratch/ledger/trim/01-read-model.md', { kind: 'trim', plugin_version: '0.7.1', before: '{added: 120, removed: 4}', after: '{added: 90, removed: 4}', proposed: '{trace: 2, reuse: 1}', applied: 3, reverted: 0, unrequested: 1 })
    artifact('.scratch/ledger/trim/02-export.md', { kind: 'trim', plugin_version: '0.7.1', before: '{added: 30, removed: 0}', after: '{added: 20, removed: 0}', proposed: '{trace: 1}', applied: 1, reverted: 1, unrequested: 0 })
    artifact('.scratch/ledger/diagnoses/slow-export.md', { kind: 'diagnosis', plugin_version: '0.7.1', status: 'cause-found', hypotheses: 3, probes: 5, levels: '[e2e, unit]' })
    artifact('.scratch/ledger/diagnoses/lost-row.md', { kind: 'diagnosis', plugin_version: '0.7.1', status: 'unresolved', hypotheses: 1, probes: 9, levels: '[unit]' })

    const sut = measure({ cwd: repo, scope: [] })
    const sumsOf = (kind) => sut.sums.find((entry) => entry.kind === kind)

    assert.deepEqual(
      { trim: sumsOf('trim'), diagnoses: sumsOf('diagnoses') },
      {
        trim: { plugin_version: '0.7.1', kind: 'trim', files: 2, sums: { before: { added: 150, removed: 4 }, after: { added: 110, removed: 4 }, proposed: { trace: 3, reuse: 1 }, applied: { sum: 4, median: 2 }, reverted: { sum: 1, median: 0.5 }, unrequested: { sum: 1, median: 0.5 } } },
        diagnoses: { plugin_version: '0.7.1', kind: 'diagnoses', files: 2, sums: { status: { 'cause-found': 1, unresolved: 1 }, hypotheses: { sum: 4, median: 2 }, probes: { sum: 14, median: 7 }, levels: { e2e: 1, unit: 2 } } },
      },
    )
  })

  test('the ticket sets are listed per feature', () => {
    finished('ledger', '01-read-model')
    artifact('.scratch/ledger/tickets-validation.md', { kind: 'tickets-validation', tickets: 4, seams: 3, dispersion: 2.5, fired: '{SZ: 1}' })

    assert.deepEqual(measure({ cwd: repo, scope: [] }).ticket_sets, [{ feature: 'ledger', tickets: 4, seams: 3, dispersion: 2.5, fired: { SZ: 1 } }])
  })

  test('a ticket costs what the Cost by stage rows that name it add up to, and one no session covers is not measured', () => {
    finished('ledger', '01-read-model')
    finished('ledger', '02-export')
    put(
      'docs/meta-retro/2026-11-20-a1b2.md',
      `${frontmatter({ kind: 'meta-retro' })}\n## Cost by stage (required)\n\n| Stage | Minutes | Idle | Tool calls | Invocations |\n|---|---|---|---|---|\n| \`/tm-plan 01-read-model\` | 12 | 0 | 40 | 1 |\n| \`/tm-implement ledger/01-read-model\` | 30 | 5 | 210 | 2 |\n| (before the first stage) | 3 | 0 | 9 | 0 |\n\n## What the conversation couldn't tell me\n`,
    )

    const sut = measure({ cwd: repo, scope: [] })

    assert.deepEqual(
      sut.tickets.map((row) => [row.ticket, row.minutes, row.tool_calls]),
      [['ledger/01-read-model', 42, 250], ['ledger/02-export', 'not measured', 'not measured']],
    )
  })

  test('an artifact that predates a measured field is named, and its cell says not measured', () => {
    ticket('ledger', '01-read-model')
    plan('ledger', '01-read-model')
    artifact('.scratch/ledger/plans/01-read-model/progress.md', { kind: 'progress', status: 'completed', sis_done: 3 })

    const sut = measure({ cwd: repo, scope: [] })

    assert.deepEqual(
      { cell: rowOf(sut, 'ledger/01-read-model').escalations, version: rowOf(sut, 'ledger/01-read-model').plugin_version, named: sut.not_measured },
      { cell: 'not measured', version: 'unknown', named: [{ ticket: 'ledger/01-read-model', artifact: 'progress', fields: ['sis_total', 'escalations', 'unverified', 'failed_deliverables'] }] },
    )
  })

  test('the instructions each artifact lists are checked against the sentinels, per harness', () => {
    put('CLAUDE.md', '# Shop\n\n- Sentinel (thasmorato-skills): list `CLAUDE.md:3f9a1c2e` in the `instructions` field\n')
    finished('ledger', '01-read-model', { instructions: '[CLAUDE.md:3f9a1c2e]' })
    plan('ledger', '01-read-model', { harness: 'claude-code', instructions: '[CLAUDE.md:3f9a1c2e]' })
    review('ledger', '01-read-model', { harness: 'codex', instructions: '[]' })

    assert.deepEqual(measure({ cwd: repo, scope: [] }).instructions, [
      { harness: 'claude-code', followed: 2, none: 0, stale: 0, unknown: 0 },
      { harness: 'codex', followed: 0, none: 1, stale: 0, unknown: 0 },
    ])
  })

  test('the latest earlier retro is named, to set its totals beside these', () => {
    finished('ledger', '01-read-model')
    artifact('docs/retro/2026-09-01-catalog.md', { kind: 'retro', date: '2026-09-01' })
    artifact('docs/retro/2026-10-15-ledger.md', { kind: 'retro', date: '2026-10-15' })

    assert.equal(measure({ cwd: repo, scope: [] }).previous, 'docs/retro/2026-10-15-ledger.md')
  })

  test('every measured field has a place in the section the retro pastes', () => {
    const value = (kind, field, index) => 1000 + index
    const everyField = (kind) => Object.fromEntries(MEASURED_FIELDS[kind].map((field, index) => [field, value(kind, field, index) + Object.keys(MEASURED_FIELDS).indexOf(kind) * 100]))
    ticket('ledger', '01-read-model', everyField('ticket'))
    artifact('.scratch/ledger/plans/01-read-model/plan.md', { kind: 'plan', ...everyField('plan') })
    artifact('.scratch/ledger/plans/01-read-model/progress.md', { kind: 'progress', status: 'completed', ...everyField('progress') })
    artifact('.scratch/ledger/plans/01-read-model/validation.md', { kind: 'validation', ...everyField('validation') })
    artifact('.scratch/ledger/reviews/01-read-model.md', { kind: 'review', ...everyField('review') })
    artifact('.scratch/ledger/reviews/01-read-model.second-opinion.md', { kind: 'review', ...everyField('second_opinion') })
    artifact('.scratch/ledger/trim/01-read-model.md', { kind: 'trim', ...everyField('trim') })
    artifact('.scratch/ledger/tidy/01-read-model.md', { kind: 'tidy', ...everyField('tidy') })
    artifact('.scratch/ledger/walkthrough/01-read-model.md', { kind: 'walkthrough', ...everyField('walkthrough') })
    artifact('.scratch/ledger/acceptance/01-read-model.md', { kind: 'acceptance', ...everyField('acceptance') })
    artifact('.scratch/ledger/prs/01-read-model.record.md', { kind: 'pr', ...everyField('pr_record') })
    artifact('.scratch/ledger/tickets-validation.md', { kind: 'tickets-validation', ...everyField('tickets_validation') })
    artifact('.scratch/ledger/diagnoses/slow-export.md', { kind: 'diagnosis', ...everyField('diagnoses') })

    const section = renderMeasurements(measure({ cwd: repo, scope: [] }))
    const absent = Object.entries(MEASURED_FIELDS).flatMap(([kind]) => Object.entries(everyField(kind)).filter(([, number]) => !section.includes(String(number))).map(([field]) => `${kind}.${field}`))

    assert.deepEqual(absent, [])
  })

  test('the section opens with the frontmatter lines to copy and names what was left out', () => {
    finished('ledger', '01-read-model')
    ticket('ledger', '02-export')

    const section = renderMeasurements(measure({ cwd: repo, scope: [] }))

    assert.deepEqual(
      {
        frontmatter: /^plugin_versions: \[0\.7\.1\]\nfeatures: \[ledger\]\ntickets: \[ledger\/01-read-model\]$/m.test(section),
        leftOut: /ledger\/02-export \(not started\)/.test(section),
        columns: /^\| Ticket \| Plugin version \| Model \| Harness \| Effort \|[^\n]*\| Minutes \| Tool calls \| CI red after open \| Review attention \|$/m.test(section),
      },
      { frontmatter: true, leftOut: true, columns: true },
    )
  })

  test('run as a command, it prints the section', () => {
    finished('ledger', '01-read-model')

    const result = spawnSync('node', [join(pluginRoot, 'scripts', 'retro-measure.mjs'), 'ledger', '--root', repo], { encoding: 'utf8' })

    assert.deepEqual({ status: result.status, table: /^\| ledger\/01-read-model \| 0\.7\.1 \|/m.test(result.stdout) }, { status: 0, table: true })
  })
})

describe('the one list of measured fields', () => {
  const read = (path) => readFileSync(join(pluginRoot, path), 'utf8')
  const producers = {
    ticket: 'templates/ticket.md',
    plan: 'skills/ticket-plan/PLAN-FORMAT.md',
    progress: 'skills/implement/SKILL.md',
    validation: 'skills/plan-validate/SKILL.md',
    review: 'commands/tm-review.md agents/review-verifier.md',
    second_opinion: 'commands/tm-review.md',
    trim: 'skills/trim/SKILL.md',
    tidy: 'skills/tidy/SKILL.md',
    walkthrough: 'skills/walkthrough/SKILL.md',
    acceptance: 'skills/acceptance/SKILL.md',
    pr_record: 'skills/pr/SKILL.md',
    tickets_validation: 'skills/tickets-validate/SKILL.md',
    diagnoses: 'skills/diagnose/SKILL.md',
  }

  test('every measured field is one the stage that owns the artifact writes', () => {
    const unwritten = Object.entries(MEASURED_FIELDS).flatMap(([kind, fields]) => {
      const written = producers[kind].split(' ').map(read).join('\n')
      return fields.filter((field) => !new RegExp(`^${field}: `, 'm').test(written)).map((field) => `${kind}.${field}`)
    })

    assert.deepEqual(unwritten, [])
  })

  test('the skill, the template and the flow report name the script, and none keeps a field list of its own', () => {
    const readers = ['skills/retro/SKILL.md', 'templates/retro.md', 'skills/flow-report/SKILL.md']
    const listed = (text) => Object.values(MEASURED_FIELDS).flat().filter((field) => text.includes(`\`${field}\``))

    assert.deepEqual(
      { citing: readers.filter((path) => !read(path).includes('scripts/retro-measure.mjs')), listing: readers.filter((path) => listed(read(path)).length > 6) },
      { citing: [], listing: [] },
    )
  })
})
