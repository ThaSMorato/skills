#!/usr/bin/env node
// Says, from git, the disk and the host's CLI, where a ticket's blockers stand and what this
// workspace is: the branch, whether it is a linked worktree, how far it is from the base. A stage
// that asks "is ticket 01 merged yet?" or "am I on the right branch?" answers it here first, because
// a question built on a stale premise costs the owner a turn to correct it.
// Usage: node blocker-state.mjs <ticket file> [--base <ref>]   (prints JSON)
// No dependencies beyond the Node standard library; `gh` is optional.

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

const BLOCKED_BY = /^## Blocked by[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m
const TICKET_NUMBER = /\b\d{2}\b/g
const STATUS_LINE = /^- \*\*Status:\*\*\s*([^\n|]+?)\s*$/m
const FRONTMATTER_STATUS = /^---\n[\s\S]*?^status:\s*(\S+)[\s\S]*?^---$/m
const TITLE = /^# \d{2}: (.+)$/m

export function parseBlockers(ticketText) {
  const section = ticketText.match(BLOCKED_BY)?.[1] ?? ''
  const lines = section.split('\n').filter((line) => !line.startsWith('>'))
  return [...new Set(lines.flatMap((line) => line.match(TICKET_NUMBER) ?? []))]
}

export function classifyBlocker({ ticketStatus, progressStatus, pr } = {}) {
  if (pr?.state === 'MERGED') return { state: 'merged', resolved: true }
  if (pr?.state === 'OPEN') return { state: 'in review', resolved: false }
  if (ticketStatus === 'done') return { state: 'done', resolved: true }
  if (progressStatus === 'completed') return { state: 'implemented, no PR', resolved: false }
  if (progressStatus) return { state: 'in progress', resolved: false }
  return { state: 'not started', resolved: false }
}

export function readBlockerState({ ticketPath, base, run = runCommand }) {
  if (!existsSync(ticketPath)) throw new Error(`No ticket at ${ticketPath}`)
  const cwd = dirname(ticketPath)
  const workspace = readWorkspace({ cwd, base, run })
  const pullRequests = createPullRequestFinder({ run, cwd })
  const blockers = parseBlockers(readFileSync(ticketPath, 'utf8')).map((number) => readBlocker({ number, issuesDir: cwd, pullRequests }))
  return {
    ticket: basename(ticketPath, '.md'),
    workspace,
    pr_lookup: pullRequests.lookupState(),
    blockers,
    blocked: blockers.some((blocker) => !blocker.resolved),
  }
}

function readWorkspace({ cwd, base, run }) {
  const git = (...args) => run('git', args, { cwd })
  const fetch = fetchRemote(git) // before the counts: they compare with the remote's base as it is now
  const resolvedBase = base ?? defaultBase(git)
  const [behind, ahead] = resolvedBase ? countsAgainst(git, resolvedBase) : [null, null]
  return {
    root: git('rev-parse', '--show-toplevel').stdout.trim(),
    branch: git('branch', '--show-current').stdout.trim(),
    linked_worktree: isLinkedWorktree(git),
    fetch,
    base: resolvedBase,
    ahead,
    behind,
    uncommitted: git('status', '--porcelain').stdout.split('\n').filter(Boolean).length,
  }
}

function fetchRemote(git) {
  if (!git('remote').stdout.trim()) return 'no remote'
  const fetched = git('fetch', '--quiet')
  return fetched.ok ? 'ok' : `failed: ${firstLine(fetched.stderr)}`
}

function defaultBase(git) {
  const head = git('symbolic-ref', '--short', 'refs/remotes/origin/HEAD')
  return head.ok ? head.stdout.trim() : null
}

function countsAgainst(git, ref) {
  const counts = git('rev-list', '--left-right', '--count', `${ref}...HEAD`)
  if (!counts.ok) return [null, null]
  return counts.stdout.trim().split(/\s+/).map(Number)
}

function isLinkedWorktree(git) {
  const gitDir = git('rev-parse', '--absolute-git-dir').stdout.trim()
  const commonDir = git('rev-parse', '--path-format=absolute', '--git-common-dir').stdout.trim()
  return gitDir !== commonDir
}

function readBlocker({ number, issuesDir, pullRequests }) {
  const file = readdirSync(issuesDir).find((name) => name.startsWith(`${number}-`) && name.endsWith('.md'))
  if (!file) return { ticket: number, title: null, state: 'no ticket file', resolved: false, pr: null }
  const slug = basename(file, '.md')
  const text = readFileSync(join(issuesDir, file), 'utf8')
  const progress = join(issuesDir, '..', 'plans', slug, 'progress.md')
  const progressStatus = existsSync(progress) ? readFileSync(progress, 'utf8').match(FRONTMATTER_STATUS)?.[1] : undefined
  const pr = pullRequests.find(slug)
  return {
    ticket: slug,
    title: text.match(TITLE)?.[1] ?? null,
    ...classifyBlocker({ ticketStatus: text.match(STATUS_LINE)?.[1], progressStatus, pr }),
    progress: progressStatus ?? null,
    pr,
  }
}

// The pull request body names its ticket's slug (the pr skill's `Closes` line), so the slug finds it.
// The first failure stops the lookups: without `gh`, or without auth, every later call fails the same way.
function createPullRequestFinder({ run, cwd }) {
  let failure = null

  function find(slug) {
    if (failure) return null
    const found = run('gh', ['pr', 'list', '--state', 'all', '--search', `"${slug}" in:body`, '--json', 'number,state,url'], { cwd })
    if (!found.ok) {
      failure = firstLine(found.stderr)
      return null
    }
    const [newest] = JSON.parse(found.stdout || '[]')
    return newest ?? null
  }

  const lookupState = () => (failure ? `unavailable: ${failure}` : 'gh')

  return { find, lookupState }
}

function firstLine(text) {
  return String(text).trim().split('\n')[0]
}

function runCommand(cmd, args, options) {
  const result = spawnSync(cmd, args, { ...options, encoding: 'utf8' })
  return { ok: result.status === 0, stdout: result.stdout ?? '', stderr: result.stderr || String(result.error ?? '') }
}

function parseArgs(argv) {
  const baseAt = argv.indexOf('--base')
  const base = baseAt === -1 ? undefined : argv[baseAt + 1]
  const ticketPath = argv.find((arg, index) => !arg.startsWith('--') && (baseAt === -1 || index !== baseAt + 1))
  if (!ticketPath) throw new Error('Usage: node blocker-state.mjs <ticket file> [--base <ref>]')
  return { ticketPath, base }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    console.log(JSON.stringify(readBlockerState(parseArgs(process.argv.slice(2))), null, 2))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
