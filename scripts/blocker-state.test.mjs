import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { parseBlockers, classifyBlocker, readBlockerState } from './blocker-state.mjs'

const ticketText = ({ status = 'ready', blockedBy = 'none (can start immediately)' } = {}) => `---
kind: ticket
---

# 02: Ledger export

## Metadata (required)
- **Status:** ${status}

## Blocked by (required)
> The tickets that gate this one, by number, or \`none (can start immediately)\`.
${blockedBy}

## Acceptance criteria (required)
- [ ] **AC-1**: the export lists every entry of 2024-01
`

describe('parseBlockers', () => {
  test('a ticket that can start immediately has no blockers', () => {
    assert.deepEqual(parseBlockers(ticketText()), [])
  })

  test('the blockers are the ticket numbers under Blocked by, not the ones in the guidance or elsewhere', () => {
    const sut = ticketText({ blockedBy: '- `01`: ledger read model\n- 03 (the CSV writer)' })

    assert.deepEqual(parseBlockers(sut), ['01', '03'])
  })
})

describe('classifyBlocker', () => {
  test('a blocker whose pull request merged no longer blocks', () => {
    assert.deepEqual(classifyBlocker({ pr: { number: 7, state: 'MERGED' } }), { state: 'merged', resolved: true })
  })

  test('a blocker with an open pull request still blocks, and says where its work is', () => {
    assert.deepEqual(classifyBlocker({ pr: { number: 7, state: 'OPEN' } }), { state: 'in review', resolved: false })
  })

  test('a blocker implemented but never opened as a pull request still blocks', () => {
    assert.deepEqual(classifyBlocker({ progressStatus: 'completed' }), { state: 'implemented, no PR', resolved: false })
  })

  test('a blocker its ticket marks done no longer blocks', () => {
    assert.deepEqual(classifyBlocker({ ticketStatus: 'done' }), { state: 'done', resolved: true })
  })

  test('a blocker nobody started still blocks', () => {
    assert.deepEqual(classifyBlocker({}), { state: 'not started', resolved: false })
  })
})

describe('readBlockerState', () => {
  let repo
  const git = (...args) => spawnSync('git', args, { cwd: repo, encoding: 'utf8' })
  const realGit = (cmd, args, options) => {
    const result = spawnSync(cmd, args, { ...options, encoding: 'utf8' })
    return { ok: result.status === 0, stdout: result.stdout ?? '', stderr: result.stderr ?? String(result.error ?? '') }
  }
  const withGh = (gh) => (cmd, args, options) => (cmd === 'gh' ? gh(args) : realGit(cmd, args, options))
  const ghAnswering = (prs) => withGh(() => ({ ok: true, stdout: JSON.stringify(prs), stderr: '' }))
  const ghMissing = withGh(() => ({ ok: false, stdout: '', stderr: 'gh: command not found' }))
  const ticketPath = () => join(repo, '.scratch/ledger/issues/02-ledger-export.md')

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), 'blocker-state-'))
    git('init', '-q', '-b', 'main')
    git('config', 'user.email', 'owner@example.com')
    git('config', 'user.name', 'Owner')
    git('config', 'commit.gpgsign', 'false')
    writeFileSync(join(repo, 'README.md'), 'ledger\n')
    git('add', '.')
    git('commit', '-q', '-m', 'init')
    git('checkout', '-q', '-b', 'feat/ledger-export')
    writeFileSync(join(repo, 'export.js'), 'export {}\n')
    git('add', '.')
    git('commit', '-q', '-m', 'export')

    mkdirSync(join(repo, '.scratch/ledger/issues'), { recursive: true })
    mkdirSync(join(repo, '.scratch/ledger/plans/01-ledger-read-model'), { recursive: true })
    writeFileSync(join(repo, '.scratch/ledger/issues/01-ledger-read-model.md'), ticketText())
    writeFileSync(ticketPath(), ticketText({ blockedBy: '- `01`: ledger read model' }))
    writeFileSync(join(repo, '.scratch/ledger/plans/01-ledger-read-model/progress.md'), '---\nstatus: completed\n---\n')
  })

  afterEach(() => rmSync(repo, { recursive: true, force: true }))

  test('a ticket whose only blocker merged is not blocked', () => {
    const sut = readBlockerState({ ticketPath: ticketPath(), base: 'main', run: ghAnswering([{ number: 7, state: 'MERGED', url: 'https://example.com/pr/7' }]) })

    assert.deepEqual(
      { blocked: sut.blocked, blockers: sut.blockers.map(({ ticket, state, pr }) => ({ ticket, state, pr: pr?.number })) },
      { blocked: false, blockers: [{ ticket: '01-ledger-read-model', state: 'merged', pr: 7 }] },
    )
  })

  test('without the host CLI the blocker is judged from the disk, and the report says the lookup failed', () => {
    const sut = readBlockerState({ ticketPath: ticketPath(), base: 'main', run: ghMissing })

    assert.deepEqual(
      { blocked: sut.blocked, state: sut.blockers[0].state, lookup: sut.pr_lookup.startsWith('unavailable') },
      { blocked: true, state: 'implemented, no PR', lookup: true },
    )
  })

  test('the workspace says which branch and worktree this is and how far it is from the base', () => {
    const sut = readBlockerState({ ticketPath: ticketPath(), base: 'main', run: ghAnswering([]) })

    assert.deepEqual(
      { branch: sut.workspace.branch, linkedWorktree: sut.workspace.linked_worktree, ahead: sut.workspace.ahead, behind: sut.workspace.behind },
      { branch: 'feat/ledger-export', linkedWorktree: false, ahead: 1, behind: 0 },
    )
  })

  test('a repository with no remote says so instead of reporting a fetch that fetched nothing', () => {
    const sut = readBlockerState({ ticketPath: ticketPath(), base: 'main', run: ghAnswering([]) })

    assert.equal(sut.workspace.fetch, 'no remote')
  })

  test('a ticket path that does not exist fails with the path in the message', () => {
    assert.throws(() => readBlockerState({ ticketPath: join(repo, 'nope.md'), run: ghAnswering([]) }), /nope\.md/)
  })
})
