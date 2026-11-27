#!/usr/bin/env node
// Says where every ticket stands, from the frontmatter its stages wrote: the ticket, the node map,
// the plan, its validation (stale when the plan changed after it), the progress, the review, the trim,
// tidy and walkthrough records, the acceptance record, the PR body, and per feature its ticket-set
// validation and its diagnoses. A ticket implemented in another worktree with its own copy of
// .scratch is read from there. A feature whose tickets all completed is `awaiting-retro` until the
// retros cover every one of them: a retro names its `features` and the `tickets` it covered, so a
// ticket that finished after it is still owed one. /tm-flow builds its matrix from this, and
// retro-measure.mjs the retro's and the flow report's counts.
// Usage: node flow-state.mjs [--root <dir>]          (prints JSON)
//        node flow-state.mjs resolve <text> [--root <dir>] (the tickets a loose slug names)
// No dependencies beyond the Node standard library.

import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'

import { readFrontmatter } from './artifact-frontmatter.mjs'
import { readWorktrees } from './worktrees.mjs'

const STATUS_LINE = /^- \*\*Status:\*\*\s*([^\n|]+?)\s*$/m
const TITLE = /^# \d{2}: (.+)$/m
const BODY_STATUS = /^(?:- )?\*\*Status:\*\*\s*([a-z_]+)/m
// `done` is the second value versions before 0.7.0 wrote. This list is the one definition of finished.
const FINISHED = ['completed', 'done']

export function flowState({ cwd, run }) {
  const { root, worktrees } = readWorktrees({ cwd, run })
  const copies = worktrees.filter((worktree) => !worktree.main && worktree.scratch === 'copy')
  const retros = readRetros(root)
  const features = listTickets(root).reduce((byFeature, ticket) => byFeature.set(ticket.feature, [...(byFeature.get(ticket.feature) ?? []), ticket]), new Map())
  return {
    root,
    features: [...features].map(([feature, tickets]) => {
      const read = tickets.map((ticket) => readTicket({ ...ticket, root, copies }))
      const covering = retros.filter((retro) => retro.features.includes(feature))
      return {
        feature,
        state: featureState(read, covering),
        retro: covering.at(-1)?.file ?? null,
        tickets_validation: frontmatterOf(join(root, '.scratch', feature, 'tickets-validation.md')),
        diagnoses: frontmattersIn(join(root, '.scratch', feature, 'diagnoses')),
        tickets: read,
      }
    }),
  }
}

export function resolveTicket({ cwd, text }) {
  const { root } = readWorktrees({ cwd })
  const tickets = listTickets(root)
  const exact = tickets.filter((ticket) => ticket.slug === text)
  const numbered = tickets.filter((ticket) => ticket.slug.slice(0, 2) === text)
  const partial = tickets.filter((ticket) => ticket.slug.includes(text))
  return [exact, numbered, partial].find((matches) => matches.length) ?? []
}

function listTickets(root) {
  const scratch = join(root, '.scratch')
  return subdirectories(scratch)
    .flatMap((feature) => markdownFiles(join(scratch, feature, 'issues')).map((file) => ({ feature, slug: basename(file, '.md'), path: join(scratch, feature, 'issues', file) })))
    .filter((ticket) => /^\d{2}-/.test(ticket.slug))
}

function readTicket({ feature, slug, path, root, copies }) {
  const home = homeOf({ feature, slug, root, copies })
  const at = (...parts) => join(home, '.scratch', feature, ...parts)
  const text = readFileSync(path, 'utf8')
  const fields = readFrontmatter(text) ?? {}
  return {
    feature,
    slug,
    title: text.match(TITLE)?.[1] ?? null,
    status: text.match(STATUS_LINE)?.[1] ?? fields.status ?? null,
    ticket: fields,
    worktree: home === root ? 'main' : home,
    design: existsSync(at('design', `${slug}.md`)),
    plan: frontmatterOf(at('plans', slug, 'plan.md')),
    validation: validationOf(at('plans', slug)),
    progress: progressOf(at('plans', slug, 'progress.md')),
    review: frontmatterOf(at('reviews', `${slug}.md`)),
    second_opinion: frontmatterOf(at('reviews', `${slug}.second-opinion.md`)),
    trim: frontmatterOf(at('trim', `${slug}.md`)),
    tidy: frontmatterOf(at('tidy', `${slug}.md`)),
    walkthrough: frontmatterOf(at('walkthrough', `${slug}.md`)),
    acceptance: frontmatterOf(at('acceptance', `${slug}.md`)),
    pr: existsSync(at('prs', `${slug}.md`)),
    pr_record: frontmatterOf(at('prs', `${slug}.record.md`)),
  }
}

// A worktree whose own copy holds this ticket's progress is where the ticket runs. When several do,
// the one whose branch names the ticket wins, then the most recently written progress.
function homeOf({ feature, slug, root, copies }) {
  const progressAt = (path) => join(path, '.scratch', feature, 'plans', slug, 'progress.md')
  const holders = [{ path: root, branch: null }, ...copies].filter((worktree) => existsSync(progressAt(worktree.path)))
  if (holders.length <= 1) return holders[0]?.path ?? root
  const named = holders.find((worktree) => worktree.branch?.includes(slug))
  return (named ?? holders.reduce((latest, worktree) => (statSync(progressAt(worktree.path)).mtimeMs > statSync(progressAt(latest.path)).mtimeMs ? worktree : latest))).path
}

function validationOf(planDir) {
  const fields = frontmatterOf(join(planDir, 'validation.md'))
  if (!fields) return null
  const plan = join(planDir, 'plan.md')
  const stale = fields.plan_sha256 && existsSync(plan) ? sha256(readFileSync(plan)) !== fields.plan_sha256 : null
  return { ...fields, stale }
}

export function isFinished(ticket) {
  return FINISHED.includes(ticket.progress?.status)
}

function featureState(tickets, retros) {
  if (tickets.every(isFinished)) return tickets.every((ticket) => retros.some((retro) => covers(retro, ticket))) ? 'retro done' : 'awaiting-retro'
  return tickets.some((ticket) => ticket.design || ticket.plan || ticket.progress) ? 'in progress' : 'not started'
}

function covers(retro, ticket) {
  return retro.tickets === null || retro.tickets.includes(`${ticket.feature}/${ticket.slug}`)
}

function readRetros(root) {
  const dir = join(root, 'docs', 'retro')
  return markdownFiles(dir).map((file) => {
    const fields = frontmatterOf(join(dir, file))
    return { file: `docs/retro/${file}`, features: featuresOf(fields), tickets: Array.isArray(fields.tickets) ? fields.tickets.map(String) : null }
  })
}

// A retro from before the `features` field has only its free-text scope: its words are read as
// feature names, with every ticket of each covered.
function featuresOf(fields) {
  return Array.isArray(fields.features) ? fields.features.map(String) : String(fields.scope ?? '').split(/[\s,]+/).filter(Boolean)
}

function frontmatterOf(path) {
  return existsSync(path) ? readFrontmatter(readFileSync(path, 'utf8')) ?? {} : null
}

// A progress file from before the frontmatter says where it stands in its body.
function progressOf(path) {
  const fields = frontmatterOf(path)
  if (!fields || fields.status) return fields
  const status = readFileSync(path, 'utf8').match(BODY_STATUS)?.[1]
  return status ? { ...fields, status } : fields
}

function frontmattersIn(dir) {
  return markdownFiles(dir).map((file) => ({ file, ...frontmatterOf(join(dir, file)) }))
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function subdirectories(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
}

function markdownFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((name) => name.endsWith('.md')).sort()
}

function parseArgs(argv) {
  const at = argv.indexOf('--root')
  const cwd = at === -1 ? process.cwd() : argv[at + 1]
  const words = argv.filter((arg, index) => !arg.startsWith('--') && (at === -1 || index !== at + 1))
  if (words[0] === 'resolve' && !words[1]) throw new Error('Usage: node flow-state.mjs resolve <text> [--root <dir>]')
  return words[0] === 'resolve' ? { mode: 'resolve', text: words[1], cwd } : { mode: 'state', cwd }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const args = parseArgs(process.argv.slice(2))
    console.log(JSON.stringify(args.mode === 'resolve' ? resolveTicket(args) : flowState(args), null, 2))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
