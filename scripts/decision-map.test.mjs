import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { decidedElsewhere, frontier, openElsewhere } from './decision-map.mjs'

// An effort too big for one session, with a path not yet clear, needs one place that says what is
// decided, what is open and what is still fog. The decisions live in the documents they bind; the map
// is their index, so collecting the open ones from those documents is mechanical, and so is the
// frontier: the open decisions nothing open still blocks.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const script = join(root, 'scripts', 'decision-map.mjs')
const read = (path) => readFileSync(join(root, path), 'utf8')

const aMap = (rows) =>
  [
    '# Decision map: checkout',
    '',
    '## Open decisions',
    '| Id | Decision | Type | Blocks | Blocked by |',
    '|---|---|---|---|---|',
    ...rows.map((row) => `| ${row.join(' | ')} |`),
    '',
    '## Fog',
    '- whether refunds need their own flow',
  ].join('\n')

describe('frontier', () => {
  test('an open decision with nothing blocking it is on the frontier, with its type', () => {
    const sut = frontier(aMap([['D-1', 'Which payment provider', 'research', 'D-2', 'nothing']]))

    assert.deepEqual(sut, [{ id: 'D-1', decision: 'Which payment provider', type: 'research' }])
  })

  test('a decision blocked by another open one waits', () => {
    const sut = frontier(aMap([['D-1', 'Which provider', 'research', 'D-2', '-'], ['D-2', 'Card form layout', 'prototype', '', 'D-1']]))

    assert.deepEqual(sut.map(({ id }) => id), ['D-1'])
  })

  test('a blocker that is no longer an open row has been decided, so the decision is free', () => {
    const sut = frontier(aMap([['D-2', 'Card form layout', 'prototype', '', 'D-1']]))

    assert.deepEqual(sut.map(({ id }) => id), ['D-2'])
  })

  test('a map with no open decisions has an empty frontier', () => {
    assert.deepEqual(frontier('# Decision map\n\n## Decided\n- **D-1** (2026-10-30): Stripe\n'), [])
  })
})

describe('openElsewhere', () => {
  let repo
  const put = (path, text) => {
    mkdirSync(dirname(join(repo, path)), { recursive: true })
    writeFileSync(join(repo, path), text)
  }

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), 'decision-map-'))
  })

  afterEach(() => rmSync(repo, { recursive: true, force: true }))

  test('collects the open questions of the effort and every Needs Input, with file and line', () => {
    put('.scratch/checkout/brief.md', '# Brief\n\n## Open questions / Needs Input (required)\n- Who approves a refund over the limit?\n- [ ] Do guests check out?\n\n## Scope\n- not this\n')
    put('docs/features/cart/fdd.md', '# FDD\n\n> [!CAUTION]\n> Needs Input: the session timeout\n')

    assert.deepEqual(openElsewhere({ root: repo, effort: 'checkout' }), [
      { file: '.scratch/checkout/brief.md', line: 4, text: 'Who approves a refund over the limit?' },
      { file: '.scratch/checkout/brief.md', line: 5, text: 'Do guests check out?' },
      { file: 'docs/features/cart/fdd.md', line: 4, text: 'the session timeout' },
    ])
  })

  test('another effort, the map itself, comments and sent questionnaires are not open decisions', () => {
    put('.scratch/other/brief.md', '## Open questions\n- not this effort\n')
    put('.scratch/checkout/decision-map.md', '> Needs Input: the map lists, it is not a source\n')
    put('docs/product/prd.md', '<!--\n> Needs Input: a template comment\n-->\n')
    put('docs/questionnaires/2026-10-30-pm.md', '> Needs Input: asked out, not open here\n')

    assert.deepEqual(openElsewhere({ root: repo, effort: 'checkout' }), [])
  })

  test('what was decided outside the map is listed mechanically: the Decided markers and the ADRs, wherever they live', () => {
    put('docs/research/payment-provider.md', '# Which provider\n\n> [!NOTE]\n> Decided: Stripe, accepted by the owner.\n')
    put('docs/adr/0001-no-stored-cards.md', '---\nstate: accepted\n---\n# ADR-0001: We do not store cards\n')
    put('.scratch/checkout/brief.md', '> Decided: guests check out without an account.\n')
    put('.scratch/other/brief.md', '> Decided: not this effort\n')

    assert.deepEqual(decidedElsewhere({ root: repo, effort: 'checkout' }), [
      { file: '.scratch/checkout/brief.md', line: 1, text: 'guests check out without an account.' },
      { file: 'docs/adr/0001-no-stored-cards.md', line: 4, text: 'ADR-0001: We do not store cards (accepted)' },
      { file: 'docs/research/payment-provider.md', line: 4, text: 'Stripe, accepted by the owner.' },
    ])
  })

  test('the command line prints the frontier of the effort map and what is open elsewhere', () => {
    put('.scratch/checkout/decision-map.md', aMap([['D-1', 'Which provider', 'research', '', 'nothing']]))
    put('.scratch/checkout/brief.md', '## Open questions\n- Guests?\n')

    const run = spawnSync('node', [script, 'frontier', '--effort', 'checkout', '--root', repo], { encoding: 'utf8' })

    assert.deepEqual(JSON.parse(run.stdout), {
      map: '.scratch/checkout/decision-map.md',
      frontier: [{ id: 'D-1', decision: 'Which provider', type: 'research' }],
      elsewhere: [{ file: '.scratch/checkout/brief.md', line: 2, text: 'Guests?' }],
    })
  })
})

describe('the decision map stage', () => {
  const skill = read('skills/decision-map/SKILL.md')

  test('the command reads the stage skill and stops at its postflight', () => {
    const command = read('commands/tm-decision-map.md')

    assert.match(command, /skills\/decision-map\/SKILL\.md/)
    assert.match(command, /Postflight/)
  })

  test('the destination is agreed before any decision, and a map with no fog is skipped', () => {
    assert.match(skill, /destination first/i)
    assert.match(skill, /skip the map/)
  })

  test('each decision type names the stage that resolves it, and the owner runs it', () => {
    for (const command of ['/tm-interview', '/tm-prototype', '/tm-research', '/tm-questionnaire', '/tm-analyze']) assert.match(skill, new RegExp(command))
    assert.match(skill, /owner task/)
  })

  test('one decision per session, recorded where it lives, a revision dated with what it replaced', () => {
    assert.match(skill, /one decision per session/i)
    assert.match(skill, /was:/)
    assert.match(skill, /`- \*\*D-<n>\*\* \(<YYYY-MM-DD>\): <the decision>\. Lives in: <path#anchor \| here>`/)
    assert.match(skill, /the next free id/)
  })

  test('every session sweeps decisions taken elsewhere, with the script, and reviews each fog item against them', () => {
    assert.match(skill, /decided elsewhere/i)
    assert.match(skill, /decision-map\.mjs" decided --effort <effort>/)
    assert.match(skill, /every fog item/i)
  })

  test('the map never writes code and never becomes the plan', () => {
    assert.match(skill, /never writes code/i)
    assert.match(skill, /`\/tm-decompose`/)
    assert.match(skill, /closes when/i)
  })

  test('the template has the sections the map is made of', () => {
    const template = read('templates/decision-map.md')

    for (const section of ['Destination', 'Decided', 'Open decisions', 'Open elsewhere', 'Fog', 'Out of scope', 'Next step']) assert.match(template, new RegExp(`## ${section}`))
    assert.match(template, /\| Id \| Decision \| Type \| Blocks \| Blocked by \|/)
  })

  test('the flow shows the frontier of an open map and offers the map before the interview', () => {
    const flow = read('commands/tm-flow.md')

    assert.match(flow, /`\.scratch\/<effort>\/decision-map\.md`/)
    assert.match(flow, /decision-map\.mjs" frontier/)
    assert.match(flow, /`\/tm-decision-map <effort>`/)
  })
})
