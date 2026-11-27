#!/usr/bin/env node
// Prints the Measurements section of a retro: every count a finished ticket's stages wrote in
// frontmatter, summed here so the model never adds them up. One row per finished ticket, totals by
// plugin version, by author and by gear, the reviews by author and reviewer, each lens's precision,
// the sums per artifact, the ticket sets, the instruction sentinels per harness, and the cost from
// the meta-retros' Cost by stage rows. A field an artifact predates is `not measured`, never guessed.
// MEASURED_FIELDS is the one list of what is measured: the retro skill, its template and the flow
// report cite this script instead of keeping a list of their own.
// Usage: node retro-measure.mjs [<feature> | <feature>/<NN-slug>]... [--root <dir>]   (prints Markdown)
// No dependencies beyond the Node standard library.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { readFrontmatter } from './artifact-frontmatter.mjs'
import { flowState, isFinished } from './flow-state.mjs'
import { checkInstructions, readSentinels } from './instructions-sentinel.mjs'

export const MEASURED_FIELDS = {
  ticket: ['type', 'gear', 'acs'],
  plan: ['sis_planned', 'revision'],
  progress: ['sis_done', 'sis_total', 'escalations', 'unverified', 'failed_deliverables'],
  validation: ['run', 'fired'],
  review: ['findings', 'by_severity', 'by_lens', 'verdicts', 'refuted_by_lens'],
  second_opinion: ['not_in_first'],
  trim: ['before', 'after', 'proposed', 'applied', 'reverted', 'unrequested'],
  tidy: ['proposed', 'applied', 'reverted', 'review_findings'],
  walkthrough: ['questions', 'missed', 'unclear_after'],
  acceptance: ['items', 'by_verdict', 'failed', 'friction', 'mocked', 'source_read'],
  pr_record: ['review_attention', 'ci_red_after_open'],
  tickets_validation: ['tickets', 'seams', 'dispersion', 'fired'],
  diagnoses: ['status', 'hypotheses', 'probes', 'levels'],
}

const NOT_MEASURED = 'not measured'
const NO_ARTIFACT = '-'
const UNKNOWN = 'unknown'
const FEATURE_KINDS = ['tickets_validation', 'diagnoses']
const TICKET_KINDS = Object.keys(MEASURED_FIELDS).filter((kind) => !FEATURE_KINDS.includes(kind))

// The per-ticket table: its header, the row key, and the artifact field each cell is read from.
const TICKET_COLUMNS = [
  ['Plugin version', 'plugin_version', 'progress', 'plugin_version'],
  ['Model', 'model', 'progress', 'model'],
  ['Harness', 'harness', 'progress', 'harness'],
  ['Effort', 'effort', 'progress', 'effort'],
  ['Gear', 'gear', 'ticket', 'gear'],
  ['Type', 'type', 'ticket', 'type'],
  ['ACs', 'acs', 'ticket', 'acs'],
  ['SIs planned', 'sis_planned', 'plan', 'sis_planned'],
  ['SIs done', 'sis_done', 'progress', 'sis_done'],
  ['Plan revisions', 'plan_revisions', 'plan', 'revision', revisionsAfterTheFirst],
  ['Validation runs', 'validation_runs', 'validation', 'run'],
  ['Escalations', 'escalations', 'progress', 'escalations'],
  ['Unverified', 'unverified', 'progress', 'unverified'],
  ['Failed deliverables', 'failed_deliverables', 'progress', 'failed_deliverables'],
  ['Review findings', 'review_findings', 'review', 'findings'],
  ['Minutes', 'minutes'],
  ['Tool calls', 'tool_calls'],
  ['CI red after open', 'ci_red_after_open', 'pr_record', 'ci_red_after_open'],
  ['Review attention', 'review_attention', 'pr_record', 'review_attention'],
]
const AUTHORSHIP = ['plugin_version', 'model', 'harness', 'effort']

const GROUP_COLUMNS = [
  ['Tickets', 'tickets'],
  ['Types', 'types'],
  ['Median ACs', 'median_acs'],
  ['Median SIs planned', 'median_sis_planned'],
  ['SIs per AC', 'sis_per_ac'],
  ['SIs done', 'sis_done'],
  ['Plan revisions', 'plan_revisions'],
  ['Validation runs', 'validation_runs'],
  ['Escalations', 'escalations'],
  ['Unverified', 'unverified'],
  ['Failed deliverables', 'failed_deliverables'],
  ['Review findings', 'review_findings'],
  ['Median review findings', 'median_review_findings'],
  ['Minutes', 'minutes'],
  ['Tool calls', 'tool_calls'],
]

export function measure({ cwd, scope = [], run }) {
  const state = flowState({ cwd, run })
  const features = featuresInScope(state.features, scope)
  const inScope = features.flatMap((feature) => feature.tickets.filter((ticket) => selects(scope, ticket)))
  const measured = inScope.filter(isFinished)
  const costs = costByTicket(state.root, measured)
  const tickets = measured.map((ticket) => ticketRow(ticket, costs))
  const measuredFeatures = features.filter((feature) => measured.some((ticket) => ticket.feature === feature.feature))
  return {
    frontmatter: {
      plugin_versions: distinct(tickets.map((row) => row.plugin_version)),
      features: measuredFeatures.map((feature) => feature.feature),
      tickets: tickets.map((row) => row.ticket),
    },
    left_out: inScope.filter((ticket) => !isFinished(ticket)).map((ticket) => ({ ticket: idOf(ticket), status: ticket.progress?.status ?? 'not started' })),
    previous: latestRetro(state.root),
    tickets,
    by_plugin_version: groupTickets(tickets, ['plugin_version']),
    by_author: groupTickets(tickets, ['model', 'harness']),
    by_gear: groupTickets(tickets, ['gear']),
    reviews: reviewPairs(measured),
    lenses: lensPrecision(measured),
    sums: sumsByArtifact(measured, measuredFeatures),
    ticket_sets: measuredFeatures.filter((feature) => feature.tickets_validation).map((feature) => ({ feature: feature.feature, ...pick(feature.tickets_validation, MEASURED_FIELDS.tickets_validation) })),
    instructions: instructionsByHarness(state.root, measured, measuredFeatures),
    not_measured: measured.flatMap(fieldsNotMeasured),
  }
}

function featuresInScope(features, scope) {
  const unknown = scope.filter((selector) => !features.some((feature) => feature.tickets.some((ticket) => selects([selector], ticket))))
  if (unknown.length) throw new Error(`${unknown.join(', ')}: no feature or ticket by that name under .scratch/ (features: ${features.map((feature) => feature.feature).join(', ') || 'none'})`)
  return features
}

function selects(scope, ticket) {
  return scope.length === 0 || scope.includes(ticket.feature) || scope.includes(idOf(ticket))
}

function idOf(ticket) {
  return `${ticket.feature}/${ticket.slug}`
}

function ticketRow(ticket, costs) {
  const cells = TICKET_COLUMNS.filter(([, , artifact]) => artifact).map(([, key, artifact, field, read = asWritten]) => [key, read(cellOf(ticket[artifact], field))])
  const row = { ticket: idOf(ticket), ...Object.fromEntries(cells), ...(costs.get(idOf(ticket)) ?? { minutes: NOT_MEASURED, tool_calls: NOT_MEASURED }) }
  return { ...row, ...Object.fromEntries(AUTHORSHIP.filter((key) => !isMeasured(row[key])).map((key) => [key, UNKNOWN])) }
}

const asWritten = (cell) => cell

// A plan's `revision` is 1 when first written: the revisions are the ones after it.
function revisionsAfterTheFirst(revision) {
  return isNumber(revision) ? Math.max(revision - 1, 0) : revision
}

function cellOf(artifact, field) {
  if (!artifact) return NO_ARTIFACT
  return artifact[field] ?? NOT_MEASURED
}

function isMeasured(cell) {
  return cell !== NOT_MEASURED && cell !== NO_ARTIFACT
}

function fieldsNotMeasured(ticket) {
  return TICKET_KINDS.filter((kind) => ticket[kind])
    .map((kind) => ({ ticket: idOf(ticket), artifact: kind, fields: MEASURED_FIELDS[kind].filter((field) => ticket[kind][field] === undefined) }))
    .filter((entry) => entry.fields.length)
}

function groupTickets(rows, keys) {
  return [...groupBy(rows, (row) => keys.map((key) => row[key]).join('\u0000'))]
    .map(([, group]) => ({ ...pick(group[0], keys), ...groupTotals(group) }))
    .sort((a, b) => keys.map((key) => a[key]).join(' ').localeCompare(keys.map((key) => b[key]).join(' '), undefined, { numeric: true }))
}

function groupTotals(rows) {
  const column = (key) => rows.map((row) => row[key])
  const withBoth = rows.filter((row) => isNumber(row.acs) && isNumber(row.sis_planned))
  return {
    tickets: rows.length,
    types: tally(column('type').filter(isMeasured)),
    median_acs: medianOf(column('acs')),
    median_sis_planned: medianOf(column('sis_planned')),
    sis_per_ac: withBoth.length ? round(sumOf(withBoth.map((row) => row.sis_planned)) / sumOf(withBoth.map((row) => row.acs))) : NOT_MEASURED,
    sis_done: sumOf(column('sis_done')),
    plan_revisions: sumOf(column('plan_revisions')),
    validation_runs: sumOf(column('validation_runs')),
    escalations: sumOf(column('escalations')),
    unverified: sumOf(column('unverified')),
    failed_deliverables: sumOf(column('failed_deliverables')),
    review_findings: sumOf(column('review_findings')),
    median_review_findings: medianOf(column('review_findings')),
    minutes: sumOf(column('minutes')),
    tool_calls: sumOf(column('tool_calls')),
  }
}

// A review is read against the pair it closes: who implemented the ticket, and who reviewed it.
function reviewPairs(tickets) {
  const reviews = tickets.flatMap((ticket) =>
    [['first', ticket.review], ['second', ticket.second_opinion]]
      .filter(([, review]) => review)
      .map(([opinion, review]) => ({ author: authorOf(ticket.progress), reviewer: authorOf(review), opinion, review })),
  )
  return [...groupBy(reviews, ({ author, reviewer, opinion }) => [opinion, author, reviewer].join('\u0000'))]
    .map(([, pair]) => ({
      author: pair[0].author,
      reviewer: pair[0].reviewer,
      opinion: pair[0].opinion,
      reviews: pair.length,
      findings: countOf(pair.map(({ review }) => review.findings)),
      refuted: countOf(pair.flatMap(({ review }) => Object.values(mapOf(review.refuted_by_lens)))),
      not_in_first: countOf(pair.map(({ review }) => review.not_in_first)),
    }))
    .sort((a, b) => [a.opinion, a.author, a.reviewer].join(' ').localeCompare([b.opinion, b.author, b.reviewer].join(' ')))
}

function authorOf(artifact) {
  return `${artifact?.model ?? UNKNOWN} · ${artifact?.harness ?? UNKNOWN}`
}

function lensPrecision(tickets) {
  const reviews = tickets.map((ticket) => ticket.review).filter(Boolean)
  return [...groupBy(reviews, versionOf)]
    .flatMap(([plugin_version, group]) => {
      const raised = sumMaps(group.map((review) => mapOf(review.by_lens)))
      const refuted = sumMaps(group.map((review) => mapOf(review.refuted_by_lens)))
      return Object.keys(raised).map((lens) => ({ plugin_version, lens, raised: raised[lens], refuted: refuted[lens] ?? 0, precision: percent(raised[lens] - (refuted[lens] ?? 0), raised[lens]) }))
    })
    .sort((a, b) => `${a.plugin_version} ${a.lens}`.localeCompare(`${b.plugin_version} ${b.lens}`))
}

function sumsByArtifact(tickets, features) {
  const perTicket = TICKET_KINDS.flatMap((kind) =>
    tickets.filter((ticket) => ticket[kind]).map((ticket) => ({ kind, artifact: ticket[kind], plugin_version: kind === 'ticket' ? versionOf(ticket.progress) : versionOf(ticket[kind]) })),
  )
  const diagnoses = features.flatMap((feature) => feature.diagnoses.map((artifact) => ({ kind: 'diagnoses', artifact, plugin_version: versionOf(artifact) })))
  return [...groupBy([...perTicket, ...diagnoses], ({ plugin_version, kind }) => `${plugin_version}\u0000${kind}`)]
    .map(([, group]) => ({
      plugin_version: group[0].plugin_version,
      kind: group[0].kind,
      files: group.length,
      sums: Object.fromEntries(MEASURED_FIELDS[group[0].kind].map((field) => [field, combine(group.map(({ artifact }) => artifact[field]))])),
    }))
    .sort((a, b) => a.plugin_version.localeCompare(b.plugin_version) || kindOrder(a.kind) - kindOrder(b.kind))
}

function kindOrder(kind) {
  return Object.keys(MEASURED_FIELDS).indexOf(kind)
}

// Numbers are summed, with their median; maps are summed key by key; words and lists are tallied.
function combine(values) {
  const present = values.filter((value) => value !== undefined)
  if (present.length === 0) return NOT_MEASURED
  if (present.every(isNumber)) return { sum: sumOf(present), median: medianOf(present) }
  if (present.every(isMap)) return sumMaps(present)
  return tally(present.flat())
}

function instructionsByHarness(root, tickets, features) {
  const sentinels = readSentinels({ root })
  const artifacts = [
    ...tickets.flatMap((ticket) => TICKET_KINDS.filter((kind) => kind !== 'ticket').map((kind) => ticket[kind])),
    ...features.flatMap((feature) => [feature.tickets_validation, ...feature.diagnoses]),
  ].filter(Boolean)
  return [...groupBy(artifacts, (artifact) => artifact.harness ?? UNKNOWN)]
    .map(([harness, group]) => ({ harness, followed: 0, none: 0, stale: 0, unknown: 0, ...tally(group.map((artifact) => checkInstructions({ sentinels, values: artifact.instructions }).verdict)) }))
    .sort((a, b) => a.harness.localeCompare(b.harness))
}

// A session's meta-retro carries a Cost by stage table. A row belongs to the ticket its invocation
// names (`/tm-implement 02-export`); a row that names none stays a session total and is not summed.
function costByTicket(root, tickets) {
  const rows = markdownFiles(join(root, 'docs', 'meta-retro')).flatMap((file) => costRows(readFileSync(join(root, 'docs', 'meta-retro', file), 'utf8')))
  const costs = new Map()
  for (const row of rows) {
    const ticket = ticketNamedIn(row.Stage ?? '', tickets)
    if (!ticket) continue
    const sofar = costs.get(idOf(ticket)) ?? { minutes: 0, tool_calls: 0 }
    costs.set(idOf(ticket), { minutes: sofar.minutes + numberIn(row.Minutes), tool_calls: sofar.tool_calls + numberIn(row['Tool calls']) })
  }
  return costs
}

function costRows(text) {
  const table = text.split(/^## Cost by stage.*$/m)[1]?.split(/^## /m)[0] ?? ''
  const [header, , ...rows] = table.split('\n').filter((line) => line.trim().startsWith('|')).map(cellsOf)
  return header ? rows.map((cells) => Object.fromEntries(header.map((name, index) => [name, cells[index] ?? '']))) : []
}

function cellsOf(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())
}

function ticketNamedIn(stage, tickets) {
  const bySlug = tickets.filter((ticket) => new RegExp(`(^|[^\\w-])${ticket.slug}($|[^\\w-])`).test(stage))
  if (bySlug.length <= 1) return bySlug[0]
  const byFeature = bySlug.filter((ticket) => stage.includes(idOf(ticket)))
  return byFeature.length === 1 ? byFeature[0] : undefined
}

function latestRetro(root) {
  const dir = join(root, 'docs', 'retro')
  const retros = markdownFiles(dir).map((file) => ({ file, date: String(readFrontmatter(readFileSync(join(dir, file), 'utf8'))?.date ?? '') }))
  const latest = retros.sort((a, b) => `${a.date} ${a.file}`.localeCompare(`${b.date} ${b.file}`)).at(-1)
  return latest ? `docs/retro/${latest.file}` : null
}

export function renderMeasurements(measured) {
  const { frontmatter } = measured
  return [
    '<!-- From retro-measure.mjs: every number is a frontmatter field, summed by the script. Paste it whole. -->',
    'For the retro\'s frontmatter:',
    codeBlock([`plugin_versions: [${frontmatter.plugin_versions.join(', ')}]`, `features: [${frontmatter.features.join(', ')}]`, `tickets: [${frontmatter.tickets.join(', ')}]`]),
    `**Left out, not finished:** ${measured.left_out.map(({ ticket, status }) => `${ticket} (${status})`).join(', ') || 'none'}`,
    `**Previous retro:** ${measured.previous ?? 'none: this is the first'}`,
    table(['Ticket', ...TICKET_COLUMNS.map(([label]) => label)], measured.tickets.map((row) => [row.ticket, ...TICKET_COLUMNS.map(([, key]) => row[key])])),
    section('Totals by plugin version', groupTable(['Plugin version'], ['plugin_version'], measured.by_plugin_version)),
    section('Totals by author', groupTable(['Model', 'Harness'], ['model', 'harness'], measured.by_author)),
    section('Totals by gear', groupTable(['Gear'], ['gear'], measured.by_gear)),
    section(
      'Reviews by author and reviewer',
      table(['Author', 'Reviewer', 'Opinion', 'Reviews', 'Findings', 'Refuted', 'Not in first'], measured.reviews.map((pair) => [pair.author, pair.reviewer, pair.opinion, pair.reviews, pair.findings, pair.refuted, pair.not_in_first])),
    ),
    section('Review lenses', table(['Plugin version', 'Lens', 'Raised', 'Refuted', 'Precision'], measured.lenses.map((lens) => [lens.plugin_version, lens.lens, lens.raised, lens.refuted, lens.precision]))),
    section('Sums by artifact, per plugin version', table(['Plugin version', 'Artifact', 'Files', 'Sums'], measured.sums.map((entry) => [entry.plugin_version, entry.kind, entry.files, sumsText(entry.sums)]))),
    section('Ticket sets', table(['Feature', ...MEASURED_FIELDS.tickets_validation], measured.ticket_sets.map((set) => [set.feature, ...MEASURED_FIELDS.tickets_validation.map((field) => set[field] ?? NOT_MEASURED)]))),
    section('Instructions, per harness', table(['Harness', 'followed', 'none', 'stale', 'unknown'], measured.instructions.map((row) => [row.harness, row.followed, row.none, row.stale, row.unknown]))),
    section('Not measured', measured.not_measured.map(({ ticket, artifact, fields }) => `- ${ticket}: \`${artifact}\` predates ${fields.map((field) => `\`${field}\``).join(', ')}`).join('\n') || 'Every artifact read carries every measured field.'),
  ].join('\n\n')
}

function groupTable(labels, keys, groups) {
  return table([...labels, ...GROUP_COLUMNS.map(([label]) => label)], groups.map((group) => [...keys.map((key) => group[key]), ...GROUP_COLUMNS.map(([, key]) => group[key])]))
}

function section(title, body) {
  return `### ${title}\n\n${body}`
}

function table(headers, rows) {
  if (rows.length === 0) return '_none in scope_'
  return [headers, headers.map(() => '---'), ...rows].map((cells) => `| ${cells.map(cellText).join(' | ')} |`).join('\n')
}

function codeBlock(lines) {
  return ['```yaml', ...lines, '```'].join('\n')
}

function sumsText(sums) {
  return Object.entries(sums).map(([field, value]) => `${field} ${isMap(value) && 'sum' in value ? `${value.sum} (median ${value.median})` : cellText(value)}`).join(' · ')
}

function cellText(value) {
  if (isMap(value)) return `{${Object.entries(value).map(([key, count]) => `${key}: ${count}`).join(', ')}}`
  return Array.isArray(value) ? `[${value.join(', ')}]` : String(value)
}

function versionOf(artifact) {
  return String(artifact?.plugin_version ?? UNKNOWN)
}

function mapOf(value) {
  return isMap(value) ? value : {}
}

function sumMaps(maps) {
  return maps.reduce((total, map) => Object.entries(map).reduce((sofar, [key, count]) => ({ ...sofar, [key]: (sofar[key] ?? 0) + (isNumber(count) ? count : 0) }), total), {})
}

function tally(values) {
  return values.reduce((counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }), {})
}

function sumOf(values) {
  const numbers = values.filter(isNumber)
  return numbers.length ? round(numbers.reduce((total, value) => total + value, 0)) : NOT_MEASURED
}

// A count nothing recorded is zero: no review refuted, no finding only the second opinion had.
function countOf(values) {
  const sum = sumOf(values)
  return isNumber(sum) ? sum : 0
}

function medianOf(values) {
  const numbers = values.filter(isNumber).sort((a, b) => a - b)
  if (numbers.length === 0) return NOT_MEASURED
  const middle = Math.floor(numbers.length / 2)
  return numbers.length % 2 ? numbers[middle] : round((numbers[middle - 1] + numbers[middle]) / 2)
}

function percent(part, whole) {
  return whole ? `${Math.round((part / whole) * 100)}%` : NOT_MEASURED
}

function round(value) {
  return Math.round(value * 100) / 100
}

function numberIn(cell) {
  const number = Number(String(cell ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : 0
}

function isNumber(value) {
  return typeof value === 'number'
}

function isMap(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pick(source, keys) {
  return Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]))
}

function distinct(values) {
  return [...new Set(values.map(String))].sort()
}

function groupBy(items, keyOf) {
  return items.reduce((groups, item) => groups.set(keyOf(item), [...(groups.get(keyOf(item)) ?? []), item]), new Map())
}

function markdownFiles(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.md')).sort() : []
}

function parseArgs(argv) {
  const at = argv.indexOf('--root')
  return { cwd: at === -1 ? process.cwd() : argv[at + 1], scope: argv.filter((arg, index) => !arg.startsWith('--') && (at === -1 || index !== at + 1)) }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    console.log(renderMeasurements(measure(parseArgs(process.argv.slice(2)))))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
