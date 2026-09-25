#!/usr/bin/env node
// Turns a Claude Code session transcript (JSONL) into one readable file per compaction segment,
// keeping only the conversation: what the owner said, answered or rejected, and what the assistant
// said plus the names of the tools it called. Everything else — file snapshots, tool results,
// thinking, subagent turns, compaction summaries — is dropped: it is either bulk or not the owner.
// No dependencies beyond the Node standard library.

import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { basename, join } from 'node:path'
import { homedir } from 'node:os'

const SYSTEM_REMINDER = /<system-reminder>[\s\S]*?<\/system-reminder>/g
const HARNESS_MARKUP = /^\s*<(command-name|command-message|local-command-[a-z]+|task-notification)>/
const CLARIFY_BOILERPLATE = /^The user wants to clarify these questions\./
const REJECTION_PREFIX = /[\s\S]*the user said:\s*/i

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
    return { ...base, kind: 'answered', text: formatAnswers(entry.toolUseResult) }
  }
  if (entry.toolDenialKind) {
    return { ...base, kind: 'rejected', text: formatRejection(entry, toolNamesById) }
  }
  const blocks = asBlocks(entry.message?.content)
  if (blocks.some((block) => block.type === 'tool_result')) return null
  const text = cleanOwnerText(joinText(blocks))
  if (!text || HARNESS_MARKUP.test(text)) return null
  return { ...base, kind: 'said', text }
}

function formatAnswers({ answers, annotations = {} }) {
  return Object.entries(answers)
    .map(([question, answer]) => {
      const notes = annotations[question]?.notes
      return notes ? `${question} → ${answer} (note: ${notes})` : `${question} → ${answer}`
    })
    .join('\n')
}

function formatRejection(entry, toolNamesById) {
  const result = asBlocks(entry.message?.content).find((block) => block.type === 'tool_result')
  const toolName = toolNamesById.get(result?.tool_use_id) ?? 'tool call'
  const raw = typeof result?.content === 'string' ? result.content : joinText(asBlocks(result?.content))
  const said = REJECTION_PREFIX.test(raw) ? raw.replace(REJECTION_PREFIX, '').trim() : ''
  if (CLARIFY_BOILERPLATE.test(said)) return `[rejected ${toolName} to clarify — the clarification is the next owner turn]`
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

function renderIndex({ sessionId, transcript, segments }) {
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
  ].join('\n')
}

const pad = (n) => String(n).padStart(2, '0')

export async function extractSession({ transcript, outDir }) {
  const sessionId = basename(transcript, '.jsonl')
  const segmenter = createSegmenter()
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
  writeFileSync(join(outDir, 'index.md'), renderIndex({ sessionId, transcript, segments }))

  const ownerTurns = segments.flatMap((segment) => segment.turns).filter((turn) => turn.role === 'owner').length
  return { sessionId, segments: segments.length, ownerTurns, skippedLines }
}

function parseLine(line) {
  try {
    return JSON.parse(line)
  } catch {
    return null
  }
}

function parseArgs(argv) {
  const args = { cwd: process.cwd() }
  for (let i = 0; i < argv.length; i += 2) {
    const [flag, value] = [argv[i], argv[i + 1]]
    if (flag === '--cwd') args.cwd = value
    else if (flag === '--session') args.sessionId = value
    else if (flag === '--out') args.outRoot = value
    else if (flag === '--projects-root') args.projectsRoot = value
    else throw new Error(`Unknown argument ${flag}. Usage: session-extract.mjs [--cwd <dir>] [--session <id>] [--out <dir>]`)
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const transcript = resolveTranscript(args)
  const sessionId = basename(transcript, '.jsonl')
  const outDir = join(args.outRoot ?? join(args.cwd, '.scratch', 'session-analyze'), sessionId)
  const result = await extractSession({ transcript, outDir })
  process.stdout.write(`${JSON.stringify({ ...result, transcript, outDir })}\n`)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exit(1)
  })
}
