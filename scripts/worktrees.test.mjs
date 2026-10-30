import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'

import { parseWorktreeList, readWorktrees, planWorktrees } from './worktrees.mjs'

// An epic whose tickets run at once runs in several worktrees, and each worktree keeps its own
// progress. The coordinator sees the whole epic only by reading every worktree, and prepares new
// ones only by printing the commands: the owner decides whether, and runs them.

const progressText = ({ slug, status = 'in_progress', done = 1, total = 3 }) => `---
kind: progress
slug: ${slug}
status: ${status}
sis_done: ${done}
sis_total: ${total}
---

# Progress: ${slug}
`

describe('parseWorktreeList', () => {
  test('each worktree comes with its path, its commit and its branch, a detached one with no branch', () => {
    const porcelain = [
      'worktree /repo', 'HEAD 1111111', 'branch refs/heads/main', '',
      'worktree /repo-02-export', 'HEAD 2222222', 'branch refs/heads/ledger/02-export', '',
      'worktree /repo-spike', 'HEAD 3333333', 'detached', '',
    ].join('\n')

    assert.deepEqual(parseWorktreeList(porcelain), [
      { path: '/repo', head: '1111111', branch: 'main' },
      { path: '/repo-02-export', head: '2222222', branch: 'ledger/02-export' },
      { path: '/repo-spike', head: '3333333', branch: null },
    ])
  })
})

describe('readWorktrees and planWorktrees', () => {
  let parent
  let repo
  const git = (...args) => spawnSync('git', args, { cwd: repo, encoding: 'utf8' })
  const scratch = (...parts) => join(repo, '.scratch', ...parts)
  const writeProgress = (root, feature, slug, fields) => {
    mkdirSync(join(root, '.scratch', feature, 'plans', slug), { recursive: true })
    writeFileSync(join(root, '.scratch', feature, 'plans', slug, 'progress.md'), progressText({ slug, ...fields }))
  }
  const writeTicket = (feature, slug) => {
    mkdirSync(scratch(feature, 'issues'), { recursive: true })
    writeFileSync(scratch(feature, 'issues', `${slug}.md`), `# ${slug.slice(0, 2)}: ${slug}\n`)
    return scratch(feature, 'issues', `${slug}.md`)
  }
  const addWorktree = (name, branch) => {
    const path = join(parent, name)
    git('worktree', 'add', '-q', '-b', branch, path, 'main')
    return path
  }
  const ticketsOf = (sut, path) => sut.worktrees.find((worktree) => worktree.path === path).tickets.map((ticket) => ticket.slug)

  beforeEach(() => {
    parent = realpathSync(mkdtempSync(join(tmpdir(), 'worktrees-')))
    repo = join(parent, 'ledger-app')
    mkdirSync(repo)
    git('init', '-q', '-b', 'main')
    git('config', 'user.email', 'owner@example.com')
    git('config', 'user.name', 'Owner')
    git('config', 'commit.gpgsign', 'false')
    writeFileSync(join(repo, '.gitignore'), '.scratch\n')
    git('add', '.')
    git('commit', '-q', '-m', 'init')
  })

  afterEach(() => rmSync(parent, { recursive: true, force: true }))

  test('a ticket in progress in another worktree is read from that worktree', () => {
    const elsewhere = addWorktree('ledger-app-02-export', 'ledger/02-export')
    writeProgress(elsewhere, 'ledger', '02-export', { done: 2, total: 4 })

    const sut = readWorktrees({ cwd: repo })

    assert.deepEqual(
      sut.worktrees.find((worktree) => worktree.path === elsewhere),
      { path: elsewhere, branch: 'ledger/02-export', main: false, scratch: 'copy', tickets: [{ feature: 'ledger', slug: '02-export', status: 'in_progress', sis_done: 2, sis_total: 4 }] },
    )
  })

  test('a worktree whose .scratch links to the main one does not list its tickets twice', () => {
    writeProgress(repo, 'ledger', '01-read-model', { status: 'completed', done: 3, total: 3 })
    const linked = addWorktree('ledger-app-02-export', 'ledger/02-export')
    symlinkSync(join(repo, '.scratch'), join(linked, '.scratch'))

    const sut = readWorktrees({ cwd: linked })

    assert.deepEqual(
      { main: ticketsOf(sut, repo), linked: ticketsOf(sut, linked), mode: sut.worktrees.find((worktree) => worktree.path === linked).scratch },
      { main: ['01-read-model'], linked: [], mode: 'shared' },
    )
  })

  test('a worktree with a copy of .scratch reports what the copy holds, not what the main one holds', () => {
    writeProgress(repo, 'ledger', '02-export', { done: 0, total: 4 })
    const copied = addWorktree('ledger-app-02-export', 'ledger/02-export')
    cpSync(join(repo, '.scratch'), join(copied, '.scratch'), { recursive: true })
    writeProgress(copied, 'ledger', '02-export', { done: 3, total: 4 })

    const sut = readWorktrees({ cwd: repo })

    assert.equal(sut.worktrees.find((worktree) => worktree.path === copied).tickets[0].sis_done, 3)
  })

  test('the commands for a ticket create its branch and worktree beside the repo, from the base', () => {
    const ticket = writeTicket('ledger', '02-export')

    const sut = planWorktrees({ tickets: [ticket], base: 'main', cwd: repo })

    assert.equal(sut.worktrees[0].commands[0], `git worktree add -b ledger/02-export ${join(parent, 'ledger-app-02-export')} main`)
  })

  test('an ignored .scratch that a link would also be ignored as is linked into the new worktree', () => {
    const ticket = writeTicket('ledger', '02-export')

    const sut = planWorktrees({ tickets: [ticket], base: 'main', cwd: repo })

    assert.deepEqual(
      { scratch: sut.scratch, step: sut.worktrees[0].commands[1] },
      { scratch: 'link', step: `ln -s ${join(repo, '.scratch')} ${join(parent, 'ledger-app-02-export', '.scratch')}` },
    )
  })

  test('an ignore rule that only matches a directory makes the feature folder a copy, to be brought back', () => {
    writeFileSync(join(repo, '.gitignore'), '.scratch/\n')
    const ticket = writeTicket('ledger', '02-export')

    const sut = planWorktrees({ tickets: [ticket], base: 'main', cwd: repo })

    assert.deepEqual(
      { scratch: sut.scratch, steps: sut.worktrees[0].commands.slice(1), back: sut.worktrees[0].copy_back },
      {
        scratch: 'copy',
        steps: [`mkdir -p ${join(parent, 'ledger-app-02-export', '.scratch')}`, `cp -R ${scratch('ledger')} ${join(parent, 'ledger-app-02-export', '.scratch', 'ledger')}`],
        back: join(parent, 'ledger-app-02-export', '.scratch', 'ledger', 'plans', '02-export'),
      },
    )
  })

  test('a .scratch the repo versions needs no step: the branch carries it', () => {
    writeFileSync(join(repo, '.gitignore'), '')
    const ticket = writeTicket('ledger', '02-export')
    git('add', '.')
    git('commit', '-q', '-m', 'tickets')

    const sut = planWorktrees({ tickets: [ticket], base: 'main', cwd: repo })

    assert.deepEqual({ scratch: sut.scratch, steps: sut.worktrees[0].commands.length }, { scratch: 'tracked', steps: 1 })
  })

  test('a path with a space is quoted, so the printed command runs as printed', () => {
    const spaced = join(parent, 'ledger app')
    renameSync(repo, spaced)
    repo = spaced
    const ticket = writeTicket('ledger', '02-export')

    const sut = planWorktrees({ tickets: [ticket], base: 'main', cwd: repo })

    assert.equal(sut.worktrees[0].commands[0], `git worktree add -b ledger/02-export '${join(parent, 'ledger app-02-export')}' main`)
  })

  test('planning runs nothing: no branch and no worktree exist afterwards', () => {
    const ticket = writeTicket('ledger', '02-export')

    planWorktrees({ tickets: [ticket], base: 'main', cwd: repo })

    assert.deepEqual(
      { branches: git('branch', '--list', 'ledger/*').stdout.trim(), worktrees: parseWorktreeList(git('worktree', 'list', '--porcelain').stdout).length },
      { branches: '', worktrees: 1 },
    )
  })

  test('the default base is the remote default branch when there is one, else the current branch', () => {
    const ticket = writeTicket('ledger', '02-export')

    const sut = planWorktrees({ tickets: [ticket], cwd: repo })

    assert.equal(sut.base, 'main')
  })

  test('a ticket outside .scratch/<feature>/issues is refused', () => {
    const stray = join(repo, 'notes.md')
    writeFileSync(stray, '# 02: stray\n')

    assert.throws(() => planWorktrees({ tickets: [stray], base: 'main', cwd: repo }), /not a ticket under \.scratch\/<feature>\/issues/)
  })

  test('the worktree name comes from the repo folder, so two repos never collide', () => {
    const ticket = writeTicket('ledger', '02-export')

    const sut = planWorktrees({ tickets: [ticket], base: 'main', cwd: repo })

    assert.deepEqual({ name: basename(sut.worktrees[0].path), beside: dirname(sut.worktrees[0].path) }, { name: `${basename(repo)}-02-export`, beside: parent })
  })
})
