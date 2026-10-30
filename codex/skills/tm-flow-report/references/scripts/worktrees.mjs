#!/usr/bin/env node
// Reads every worktree of the repository and the ticket progress each one holds, and prints, never
// runs, the commands that would give a set of tickets one worktree each. An epic whose tickets run at
// once is spread over several worktrees; /tm-flow sees it whole only by reading all of them, and
// preparing new ones stays the owner's call, who may have a tool of their own for it.
// Usage: node worktrees.mjs                                   (reads; prints JSON)
//        node worktrees.mjs add <ticket file>... [--base <ref>] (prints the commands as JSON)
// No dependencies beyond the Node standard library.

import { spawnSync } from 'node:child_process'
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

const TICKET_PATH = /\.scratch\/([^/]+)\/issues\/(\d{2}-[^/]+)\.md$/
const FRONTMATTER = /^---\n([\s\S]*?)\n---/
const SHELL_SAFE = /^[\w@%+=:,./-]+$/

export function parseWorktreeList(porcelain) {
  return porcelain
    .split(/\n\n+/)
    .map((block) => block.split('\n').filter(Boolean))
    .filter((lines) => lines[0]?.startsWith('worktree '))
    .map((lines) => {
      const field = (name) => lines.find((line) => line.startsWith(`${name} `))?.slice(name.length + 1)
      return { path: field('worktree'), head: field('HEAD') ?? null, branch: field('branch')?.replace(/^refs\/heads\//, '') ?? null }
    })
}

export function readWorktrees({ cwd, run = runCommand }) {
  const git = (...args) => run('git', args, { cwd })
  const [main, ...linked] = listWorktrees(git)
  const tracked = isScratchTracked(git)
  const mainScratch = realScratch(main.path)
  const describe = (worktree, isMain) => {
    const scratch = scratchMode({ worktree: worktree.path, isMain, tracked, mainScratch })
    return { path: worktree.path, branch: worktree.branch, main: isMain, scratch, tickets: scratch === 'shared' ? [] : readProgress(worktree.path) }
  }
  return { root: main.path, worktrees: [describe(main, true), ...linked.map((worktree) => describe(worktree, false))] }
}

export function planWorktrees({ tickets, base, cwd, run = runCommand }) {
  const git = (...args) => run('git', args, { cwd })
  const [main] = listWorktrees(git)
  const scratch = scratchStep(git)
  const from = base ?? defaultBase(git)
  return { base: from, scratch, worktrees: tickets.map((ticket) => planOne({ ticket: resolve(cwd, ticket), root: main.path, scratch, base: from })) }
}

function planOne({ ticket, root, scratch, base }) {
  const [, feature, slug] = ticket.match(TICKET_PATH) ?? []
  if (!feature) throw new Error(`${ticket}: not a ticket under .scratch/<feature>/issues`)
  const branch = `${feature}/${slug}`
  const path = join(dirname(root), `${basename(root)}-${slug}`)
  const commands = [`git worktree add -b ${quote(branch)} ${quote(path)} ${quote(base)}`, ...scratchCommands({ scratch, root, path, feature })]
  const copyBack = scratch === 'copy' ? join(path, '.scratch', feature, 'plans', slug) : null
  return { ticket: slug, branch, path, commands, copy_back: copyBack }
}

// A link is one .scratch for every worktree; it works only when the ignore rule also matches a file,
// since a link is not a directory and `.scratch/` would leave it untracked in every worktree.
function scratchCommands({ scratch, root, path, feature }) {
  if (scratch === 'tracked') return []
  if (scratch === 'link') return [`ln -s ${quote(join(root, '.scratch'))} ${quote(join(path, '.scratch'))}`]
  return [`mkdir -p ${quote(join(path, '.scratch'))}`, `cp -R ${quote(join(root, '.scratch', feature))} ${quote(join(path, '.scratch', feature))}`]
}

function scratchStep(git) {
  if (isScratchTracked(git)) return 'tracked'
  const ignored = git('check-ignore', '-v', '--', '.scratch')
  if (!ignored.ok) return 'copy'
  const pattern = ignored.stdout.split('\t')[0].split(':').slice(2).join(':').replace(/^\//, '')
  return pattern.includes('/') ? 'copy' : 'link'
}

function scratchMode({ worktree, isMain, tracked, mainScratch }) {
  if (tracked) return 'tracked'
  const scratch = join(worktree, '.scratch')
  if (!existsSync(scratch)) return 'none'
  if (isMain) return 'local'
  return lstatSync(scratch).isSymbolicLink() && realpathSync(scratch) === mainScratch ? 'shared' : 'copy'
}

function readProgress(worktree) {
  const scratch = join(worktree, '.scratch')
  if (!existsSync(scratch)) return []
  return subdirectories(scratch).flatMap((feature) =>
    subdirectories(join(scratch, feature, 'plans'))
      .map((slug) => ({ feature, slug, file: join(scratch, feature, 'plans', slug, 'progress.md') }))
      .filter(({ file }) => existsSync(file))
      .map(({ feature, slug, file }) => ({ feature, slug, ...progressFields(readFileSync(file, 'utf8')) })),
  )
}

function progressFields(text) {
  const fields = Object.fromEntries(
    (text.match(FRONTMATTER)?.[1] ?? '').split('\n').map((line) => line.split(/:\s*/, 2)).filter(([key]) => key),
  )
  const count = (value) => (value === undefined || Number.isNaN(Number(value)) ? null : Number(value))
  return { status: fields.status ?? null, sis_done: count(fields.sis_done), sis_total: count(fields.sis_total) }
}

function subdirectories(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
}

function listWorktrees(git) {
  const listed = git('worktree', 'list', '--porcelain')
  if (!listed.ok) throw new Error(`git worktree list failed: ${listed.stderr.trim().split('\n')[0]}`)
  return parseWorktreeList(listed.stdout)
}

function isScratchTracked(git) {
  return git('ls-files', '--', '.scratch').stdout.trim() !== ''
}

function realScratch(root) {
  const scratch = join(root, '.scratch')
  return existsSync(scratch) ? realpathSync(scratch) : null
}

function defaultBase(git) {
  const remote = git('symbolic-ref', '--short', 'refs/remotes/origin/HEAD')
  return remote.ok ? remote.stdout.trim() : git('branch', '--show-current').stdout.trim()
}

function quote(word) {
  return SHELL_SAFE.test(word) ? word : `'${word.replace(/'/g, `'\\''`)}'`
}

function runCommand(cmd, args, options) {
  const result = spawnSync(cmd, args, { ...options, encoding: 'utf8' })
  return { ok: result.status === 0, stdout: result.stdout ?? '', stderr: result.stderr || String(result.error ?? '') }
}

function parseArgs(argv) {
  const baseAt = argv.indexOf('--base')
  const base = baseAt === -1 ? undefined : argv[baseAt + 1]
  const words = argv.filter((arg, index) => !arg.startsWith('--') && (baseAt === -1 || index !== baseAt + 1))
  if (words[0] !== 'add') return { mode: 'read' }
  if (words.length < 2) throw new Error('Usage: node worktrees.mjs add <ticket file>... [--base <ref>]')
  return { mode: 'add', tickets: words.slice(1), base }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const args = parseArgs(process.argv.slice(2))
    const cwd = process.cwd()
    const result = args.mode === 'add' ? planWorktrees({ tickets: args.tickets, base: args.base, cwd }) : readWorktrees({ cwd })
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
