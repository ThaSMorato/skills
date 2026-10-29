#!/usr/bin/env node
// Turns a session transcript (JSONL) into one readable file per compaction segment,
// keeping only the conversation: what the owner said (mid-turn messages included), answered, rejected
// or ran as a slash command (with the options a structured question offered), and what the assistant
// said plus the names of the tools it called. The index adds what each stage cost: minutes, tool
// calls, re-invocations, answers outside the options, clarifications and overruled recommendations. Everything else (file snapshots, tool results,
// thinking, subagent turns, compaction summaries) is dropped: it is either bulk or not the owner.
// Claude Code by default; `--harness codex` reads a Codex rollout (see session-extract-codex.mjs).
// No dependencies beyond the Node standard library.

import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { basename, join } from 'node:path'
import { homedir } from 'node:os'
import { codexSessionIdOf, createCodexSegmenter, resolveCodexTranscript } from './session-extract-codex.mjs'

const SYSTEM_REMINDER = /<system-reminder>[\s\S]*?<\/system-reminder>/g
const HARNESS_MARKUP = /^\s*<(local-command-[a-z]+|task-notification)>/
const COMMAND_NAME = /<command-name>([^<]*)<\/command-name>/
const COMMAND_ARGS = /<command-args>([^<]*)<\/command-args>/
const CLARIFY_BOILERPLATE = /^The user wants to clarify these questions\./
const REJECTION_PREFIX = /[\s\S]*the user said:\s*/i
const RECOMMENDED = /\(Recommended\)\s*$/
const NO_STAGE = '(no stage)'
const STAGE_PREFIX = 'tm-' // only the flow's stages open a row: /compact, /model, /login are the harness
const IDLE_AFTER_MS = 30 * 60 * 1000

export function projectDirCandidates(cwd) {
  return [...new Set([cwd.replace(/[^a-zA-Z0-9]/g, '-'), cwd.replace(/\//g, '-')])]
}

export function resolveTranscript({ projectsRoot = join(homedir(), '.claude', 'projects'), cwd, sessionId }) {
  const candidates = projectDirCandidates(cwd)
  const dir = candidates.map((name) => join(projectsRoot, name)).find((path) => existsSync(path))
  if (!dir) {
    throw new Error(`No transcript directory for ${cwd} under ${projectsRoot}. Tried: ${candidates.join(', ')}`)
  }
  if (sessionId) return namedSession(dir, sessionId)
  return mostRecentSession(dir)
}

function namedSession(dir, sessionId) {
  const path = join(dir, `${sessionId}.jsonl`)
  if (!existsSync(path)) throw new Error(`No session ${sessionId} in ${dir}`)
  return path
}

function mostRecentSession(dir) {
  const sessions = readdirSync(dir)
    .filter((name) => name.endsWith('.jsonl'))
    .map((name) => join(dir, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  if (sessions.length === 0) throw new Error(`No session transcripts in ${dir}`)
  return sessions[0]
}

export function createSegmenter() {
  const segments = [{ compaction: null, turns: [] }]
  const toolNamesById = new Map()

  const current = () => segments[segments.length - 1]

  function accept(entry) {
    if (entry.isSidechain) return
    if (isCompactionBoundary(entry)) {
      segments.push({ compaction: compactionOf(entry), turns: [] })
      return
    }
    if (entry.type === 'assistant') return acceptAssistant(entry)
    if (entry.type === 'user') return acceptOwner(entry)
    if (entry.type === 'attachment') return acceptQueued(entry)
  }

  // A message the owner sends while the assistant works is recorded only as a queued command; a
  // queued task notification is the harness, not the owner.
  function acceptQueued(entry) {
    const queued = entry.attachment
    if (queued?.type !== 'queued_command' || queued.commandMode !== 'prompt') return
    const text = cleanOwnerText(String(queued.prompt ?? ''))
    if (!text || HARNESS_MARKUP.test(text)) return
    const kind = text.startsWith('/') ? 'invoked' : 'queued'
    current().turns.push({ role: 'owner', kind, uuid: entry.uuid, timestamp: queued.timestamp ?? entry.timestamp, text })
  }

  function acceptAssistant(entry) {
    const blocks = asBlocks(entry.message?.content)
    const tools = blocks.filter((block) => block.type === 'tool_use')
    for (const tool of tools) toolNamesById.set(tool.id, tool.name)
    const text = joinText(blocks)
    if (!text && tools.length === 0) return
    current().turns.push({
      role: 'assistant',
      kind: 'said',
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      text,
      tools: tools.map((tool) => tool.name),
    })
  }

  function acceptOwner(entry) {
    if (entry.isMeta || entry.isCompactSummary) return
    const turn = ownerTurnOf(entry, toolNamesById)
    if (turn) current().turns.push(turn)
  }

  return { accept, segments: () => segments }
}

function isCompactionBoundary(entry) {
  return entry.type === 'system' && entry.subtype === 'compact_boundary'
}

function compactionOf(entry) {
  const { trigger = 'unknown', preTokens = null } = entry.compactMetadata ?? {}
  return { trigger, preTokens, at: entry.timestamp }
}

function ownerTurnOf(entry, toolNamesById) {
  const base = { role: 'owner', uuid: entry.uuid, timestamp: entry.timestamp }
  if (entry.toolUseResult?.answers) {
    return { ...base, kind: 'answered', text: formatAnswers(entry.toolUseResult), answers: answersOf(entry.toolUseResult) }
  }
  if (entry.toolDenialKind) {
    const text = formatRejection(entry, toolNamesById)
    return isClarification(entry) ? { ...base, kind: 'rejected', text, clarify: true } : { ...base, kind: 'rejected', text }
  }
  const blocks = asBlocks(entry.message?.content)
  if (blocks.some((block) => block.type === 'tool_result')) return null
  const text = cleanOwnerText(joinText(blocks))
  if (!text || HARNESS_MARKUP.test(text)) return null
  const command = slashCommandOf(text)
  if (command) return { ...base, kind: 'invoked', text: command }
  return { ...base, kind: 'said', text }
}

function slashCommandOf(text) {
  const name = text.match(COMMAND_NAME)?.[1].trim()
  if (!name) return null
  const args = text.match(COMMAND_ARGS)?.[1].trim()
  return args ? `${name} ${args}` : name
}

function formatAnswers({ answers, annotations = {}, questions = [] }) {
  return Object.entries(answers)
    .map(([question, answer]) => {
      const notes = annotations[question]?.notes
      const answered = notes ? `${question} → ${answer} (note: ${notes})` : `${question} → ${answer}`
      return answered + offeredOptions(questions.find((asked) => asked.question === question))
    })
    .join('\n')
}

function answersOf({ answers, questions = [] }) {
  return Object.entries(answers).map(([question, answer]) => {
    const offered = (questions.find((asked) => asked.question === question)?.options ?? []).map((option) => option.label)
    return { question, answer, offered, recommended: offered.find((label) => RECOMMENDED.test(label)) ?? null }
  })
}

function isClarification(entry) {
  const result = asBlocks(entry.message?.content).find((block) => block.type === 'tool_result')
  const raw = typeof result?.content === 'string' ? result.content : joinText(asBlocks(result?.content))
  return CLARIFY_BOILERPLATE.test(raw.replace(REJECTION_PREFIX, '').trim())
}

function offeredOptions(asked) {
  if (!asked?.options?.length) return ''
  const mode = asked.multiSelect ? ' (multi-select)' : ''
  return `\n  offered${mode}: ${asked.options.map((option) => option.label).join(' · ')}`
}

function formatRejection(entry, toolNamesById) {
  const result = asBlocks(entry.message?.content).find((block) => block.type === 'tool_result')
  const toolName = toolNamesById.get(result?.tool_use_id) ?? 'tool call'
  const raw = typeof result?.content === 'string' ? result.content : joinText(asBlocks(result?.content))
  const said = REJECTION_PREFIX.test(raw) ? raw.replace(REJECTION_PREFIX, '').trim() : ''
  if (CLARIFY_BOILERPLATE.test(said)) return `[rejected ${toolName} to clarify; the clarification is the next owner turn]`
  return said ? `[rejected ${toolName}] ${said}` : `[rejected ${toolName}]`
}

function asBlocks(content) {
  if (typeof content === 'string') return [{ type: 'text', text: content }]
  return Array.isArray(content) ? content : []
}

function joinText(blocks) {
  return blocks
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()
}

function cleanOwnerText(text) {
  return text.replace(SYSTEM_REMINDER, '').replace(/[ \t]{2,}/g, ' ').trim()
}

export function renderSegment(segment, { sessionId, index, total }) {
  const ownerTurns = segment.turns.filter((turn) => turn.role === 'owner').length
  const frontmatter = [
    '---',
    'kind: session-segment',
    `session: ${sessionId}`,
    `segment: ${index}`,
    `of: ${total}`,
    `compaction_trigger: ${segment.compaction?.trigger ?? 'none'}`,
    `pre_tokens: ${segment.compaction?.preTokens ?? 'none'}`,
    `owner_turns: ${ownerTurns}`,
    `assistant_turns: ${segment.turns.length - ownerTurns}`,
    '---',
  ].join('\n')
  const body = segment.turns.map(renderTurn).join('\n\n')
  return `${frontmatter}\n\n# Segment ${index} of ${total}\n\n${body}\n`
}

function renderTurn(turn) {
  if (turn.role === 'owner') {
    return `### owner · ${turn.kind} · ${turn.timestamp} · ${turn.uuid}\n${turn.text}`
  }
  const tools = turn.tools.length > 0 ? `\n\n_tools: ${turn.tools.join(', ')}_` : ''
  return `### assistant · ${turn.timestamp} · ${turn.uuid}\n${turn.text}${tools}`
}

/**
 * What each stage cost, from the turns alone: a stage runs from the owner's invocation of a flow
 * stage (`tm-*`) to the next one; a harness command between them (`/compact`) does not end it. A pause over 30 minutes is idle time, kept apart. In Codex, the answers to structured questions
 * are not extracted, so what rests on them is `null` (not measured), never 0.
 */
export function costByStage(segments, { harness = 'claude' } = {}) {
  const answersMeasured = harness !== 'codex'
  const rows = new Map()
  const rowOf = (stage) => {
    if (!rows.has(stage)) rows.set(stage, emptyCost(stage, answersMeasured))
    return rows.get(stage)
  }
  const turns = segments.flatMap((segment) => segment.turns)
  let stage = NO_STAGE
  turns.forEach((turn, index) => {
    const invoked = turn.role === 'owner' && turn.kind === 'invoked' ? stageNameOf(turn.text) : null
    if (invoked?.startsWith(STAGE_PREFIX)) {
      stage = invoked
      rowOf(stage).invocations += 1
    }
    const row = rowOf(stage)
    addGap(row, turn, turns[index + 1])
    if (turn.role === 'assistant') row.tool_calls += turn.tools.length
    if (answersMeasured) addAnswers(row, turn)
  })
  return [...rows.values()].map(({ activeMs, idleMs, ...row }) => ({ ...row, minutes: toMinutes(activeMs), idle_minutes: toMinutes(idleMs) }))
}

function emptyCost(stage, answersMeasured) {
  const counted = answersMeasured ? 0 : null
  return { stage, activeMs: 0, idleMs: 0, tool_calls: 0, invocations: 0, other_answers: counted, clarifications: counted, overrules: counted }
}

function stageNameOf(invocation) {
  return invocation.split(/\s+/)[0].replace(/^\//, '').replace(/^.*:/, '')
}

function addGap(row, turn, next) {
  const gap = next ? Date.parse(next.timestamp) - Date.parse(turn.timestamp) : 0
  if (!Number.isFinite(gap) || gap <= 0) return
  if (gap > IDLE_AFTER_MS) row.idleMs += gap
  else row.activeMs += gap
}

function addAnswers(row, turn) {
  if (turn.clarify) row.clarifications += 1
  for (const { answer, offered, recommended } of turn.answers ?? []) {
    if (offered.length === 0) continue
    const chosen = String(answer).split(', ')
    if (!chosen.every((label) => offered.includes(label))) row.other_answers += 1
    else if (recommended && !chosen.includes(recommended)) row.overrules += 1
  }
}

const toMinutes = (ms) => Math.round((ms / 60000) * 10) / 10

function renderIndex({ sessionId, transcript, segments, cost }) {
  const rows = segments.map((segment, i) => {
    const owner = segment.turns.filter((turn) => turn.role === 'owner').length
    const trigger = segment.compaction?.trigger ?? 'start'
    return `| ${i + 1} | \`seg-${pad(i + 1)}.md\` | ${trigger} | ${owner} | ${segment.turns.length - owner} |`
  })
  return [
    '---',
    'kind: session-index',
    `session: ${sessionId}`,
    `transcript: ${transcript}`,
    `segments: ${segments.length}`,
    '---',
    '',
    `# Session ${sessionId}`,
    '',
    '| Segment | File | Opened by | Owner turns | Assistant turns |',
    '|---|---|---|---|---|',
    ...rows,
    '',
    '## Cost by stage',
    '',
    '| Stage | Minutes | Idle minutes | Tool calls | Invocations | Other answers | Clarifications | Overrules |',
    '|---|---|---|---|---|---|---|---|',
    ...cost.map((row) =>
      `| ${row.stage} | ${row.minutes} | ${row.idle_minutes} | ${row.tool_calls} | ${row.invocations} | ${notMeasured(row.other_answers)} | ${notMeasured(row.clarifications)} | ${notMeasured(row.overrules)} |`,
    ),
    '',
  ].join('\n')
}

const pad = (n) => String(n).padStart(2, '0')
const notMeasured = (value) => (value === null ? 'not measured' : value)

const HARNESSES = {
  claude: { createSegmenter, sessionIdOf: async (transcript) => basename(transcript, '.jsonl') },
  codex: { createSegmenter: createCodexSegmenter, sessionIdOf: codexSessionIdOf },
}

export async function extractSession({ transcript, outDir, harness = 'claude' }) {
  const sessionId = await HARNESSES[harness].sessionIdOf(transcript)
  const segmenter = HARNESSES[harness].createSegmenter()
  let skippedLines = 0

  const lines = createInterface({ input: createReadStream(transcript), crlfDelay: Infinity })
  for await (const line of lines) {
    if (!line.trim()) continue
    const entry = parseLine(line)
    if (entry) segmenter.accept(entry)
    else skippedLines += 1
  }

  const segments = segmenter.segments()
  mkdirSync(outDir, { recursive: true })
  segments.forEach((segment, i) => {
    const content = renderSegment(segment, { sessionId, index: i + 1, total: segments.length })
    writeFileSync(join(outDir, `seg-${pad(i + 1)}.md`), content)
  })
  const cost = costByStage(segments, { harness })
  writeFileSync(join(outDir, 'index.md'), renderIndex({ sessionId, transcript, segments, cost }))

  const ownerTurns = segments.flatMap((segment) => segment.turns).filter((turn) => turn.role === 'owner').length
  return { sessionId, segments: segments.length, ownerTurns, skippedLines, cost }
}

function parseLine(line) {
  try {
    return JSON.parse(line)
  } catch {
    return null
  }
}

function parseArgs(argv) {
  const args = { cwd: process.cwd(), harness: 'claude' }
  for (let i = 0; i < argv.length; i += 2) {
    const [flag, value] = [argv[i], argv[i + 1]]
    if (flag === '--cwd') args.cwd = value
    else if (flag === '--session') args.sessionId = value
    else if (flag === '--out') args.outRoot = value
    else if (flag === '--projects-root') args.projectsRoot = value
    else if (flag === '--harness' && value in HARNESSES) args.harness = value
    else if (flag === '--codex-home') args.codexHome = value
    else throw new Error(`Unknown argument ${flag} ${value ?? ''}. Usage: session-extract.mjs [--harness claude|codex] [--cwd <dir>] [--session <id>] [--out <dir>]`)
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const transcript =
    args.harness === 'codex'
      ? await resolveCodexTranscript({ codexHome: args.codexHome ?? process.env.CODEX_HOME ?? join(homedir(), '.codex'), ...args })
      : resolveTranscript(args)
  const sessionId = await HARNESSES[args.harness].sessionIdOf(transcript)
  const outDir = join(args.outRoot ?? join(args.cwd, '.scratch', 'session-analyze'), sessionId)
  const result = await extractSession({ transcript, outDir, harness: args.harness })
  process.stdout.write(`${JSON.stringify({ ...result, transcript, outDir })}\n`)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exit(1)
  })
}
