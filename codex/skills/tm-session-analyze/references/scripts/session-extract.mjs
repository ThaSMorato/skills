#!/usr/bin/env node
// Turns a session transcript (JSONL) into one readable file per compaction segment,
// keeping only the conversation: what the owner said (mid-turn messages included), answered, rejected
// or ran as a slash command (with the options a structured question offered), and what the assistant
// said plus the tools it called: each one's name, the program a Bash call ran, whether the call
// failed and how many characters came back. The index adds what each stage cost: minutes, tool calls,
// failed calls, result characters, re-invocations, answers outside the options, clarifications and
// overruled recommendations. Everything else (file snapshots, the content of tool results, the other
// tools' arguments, thinking, subagent turns, compaction summaries) is dropped: it is either bulk,
// where file contents and secrets live, or not the owner.
// Claude Code by default; `--harness codex` reads a Codex rollout (see session-extract-codex.mjs).
// No dependencies beyond the Node standard library.

import { closeSync, createReadStream, existsSync, mkdirSync, openSync, readdirSync, readSync, statSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { basename, join } from 'node:path'
import { homedir } from 'node:os'
import { StringDecoder } from 'node:string_decoder'
import { codexSessionIdOf, createCodexSegmenter, resolveCodexTranscript } from './session-extract-codex.mjs'

const SYSTEM_REMINDER = /<system-reminder>[\s\S]*?<\/system-reminder>/g
const HARNESS_MARKUP = /^\s*<(local-command-[a-z]+|task-notification)>/
const COMMAND_NAME = /<command-name>([^<]*)<\/command-name>/
const COMMAND_ARGS = /<command-args>([^<]*)<\/command-args>/
const CLARIFY_BOILERPLATE = /^The user wants to clarify these questions\./
const REJECTION_PREFIX = /[\s\S]*the user said:\s*/i
const RECOMMENDED = /\(Recommended\)\s*$/
const NO_STAGE = '(no stage)'
const TICKET = /^(?:[a-z0-9][a-z0-9-]*\/)?\d{2}-[a-z0-9][a-z0-9-]*$/
const ANALYZER = 'tm-session-analyze'
const STAGE_PREFIX = 'tm-' // only the flow's stages open a row: /compact, /model, /login are the harness
const IDLE_AFTER_MS = 30 * 60 * 1000
const OPAQUE = 'opaque'
const PROGRAM = /^[A-Za-z0-9_.][A-Za-z0-9_.+-]{0,39}$/
const QUOTED = /'[^']*'|"(?:\\.|[^"\\])*"/g
const CONTENT_STARTS = /<<|\$\(|`|['"]/
// What may follow a runner in a label. A closed list: a word is kept because it is a public
// subcommand, never because it looks like one, since a branch, a package, a target or a token typed
// after `git checkout` or `npm install` has the same shape.
const SUBCOMMANDS = new Set([
  ...['test', 'run', 'exec', 'install', 'ci', 'build', 'lint', 'format', 'fmt', 'start', 'dev', 'typecheck', 'check', 'unit', 'e2e', 'integration', 'watch', 'fix', 'coverage'],
  ...['audit', 'outdated', 'publish', 'pack', 'add', 'remove', 'update', 'upgrade', 'init', 'create', 'clean', 'list', 'ls', 'view', 'info', 'link', 'dlx', 'x', 'sync', 'lock'],
  ...['status', 'diff', 'log', 'show', 'commit', 'push', 'pull', 'fetch', 'merge', 'rebase', 'checkout', 'switch', 'branch', 'stash', 'reset', 'restore', 'revert', 'tag', 'clone'],
  ...['worktree', 'remote', 'cherry-pick', 'blame', 'grep', 'rev-parse', 'ls-files', 'config', 'bisect', 'mv', 'rm', 'apply'],
  ...['pr', 'issue', 'repo', 'workflow', 'api', 'release', 'auth', 'edit', 'checks', 'comment', 'close', 'review'],
  ...['compose', 'ps', 'logs', 'up', 'down', 'images', 'login', 'get', 'describe', 'delete', 'rollout', 'port-forward'],
  ...['vet', 'mod', 'tidy', 'generate', 'clippy', 'bench', 'doc', 'migrate', 'serve', 'console', 'shell', 'compile', 'deps'],
  ...['node', 'tsc', 'tsx', 'eslint', 'prettier', 'biome', 'vitest', 'jest', 'playwright', 'pytest', 'ruff', 'mypy', 'rspec', 'rubocop', 'knip'],
])
// Words a program hides behind: a wrapper (`sudo npm test`) or a shell keyword (`then npm test`).
const PREFIXES = new Set(['sudo', 'time', 'env', 'nohup', 'exec', 'command', 'nice', 'if', 'elif', 'then', 'else', 'while', 'until', 'do', '!'])
// Shell words that open or close a block and run nothing themselves.
const BLOCK_WORDS = new Set(['for', 'case', 'select', 'function', 'fi', 'done', 'esac'])
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/
// Programs whose first words say what ran (`npm run lint`, `git commit`); every other program is named alone.
const RUNNERS = new Set(['npm', 'pnpm', 'yarn', 'bun', 'npx', 'deno', 'git', 'gh', 'go', 'cargo', 'make', 'just', 'docker', 'kubectl', 'mvn', 'gradle', 'dotnet', 'mix', 'bundle', 'rake', 'composer', 'poetry', 'uv', 'pip', 'turbo', 'nx'])
const MAX_SUBCOMMANDS = 2
const MAX_PROGRAMS = 3

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

// The session to read when none is named: the most recent one that did any work. After `/clear` the
// newest transcript is the session that is asking, which holds nothing but this command.
function mostRecentSession(dir) {
  const sessions = readdirSync(dir)
    .filter((name) => name.endsWith('.jsonl'))
    .map((name) => join(dir, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  if (sessions.length === 0) throw new Error(`No session transcripts in ${dir}`)
  const working = sessions.find((transcript) => !ranOnlyTheAnalyzer(transcript, createSegmenter))
  if (!working) throw new Error(`No working session in ${dir}: every transcript only ran /${ANALYZER}. Name one with --session <id>.`)
  return working
}

// Stops at the first owner turn that is anything else, so a long working session costs a few lines.
export function ranOnlyTheAnalyzer(transcript, segmenterOf) {
  const segmenter = segmenterOf()
  let lastSeen
  for (const line of linesOf(transcript)) {
    const entry = line.trim() ? parseLine(line) : null
    if (!entry) continue
    segmenter.accept(entry)
    const last = segmenter.segments().at(-1).turns.findLast((turn) => turn.role === 'owner')
    if (!last || last === lastSeen) continue
    if (last.kind !== 'invoked' || stageOf(last.text) !== ANALYZER) return false
    lastSeen = last
  }
  return lastSeen !== undefined
}

function* linesOf(path) {
  const file = openSync(path, 'r')
  const chunk = Buffer.alloc(1 << 16)
  const decoder = new StringDecoder('utf8')
  let pending = ''
  try {
    for (let read = readSync(file, chunk); read > 0; read = readSync(file, chunk)) {
      const lines = (pending + decoder.write(chunk.subarray(0, read))).split('\n')
      pending = lines.pop()
      yield* lines
    }
    if (pending) yield pending
  } finally {
    closeSync(file)
  }
}

export function createSegmenter() {
  const segments = [{ compaction: null, turns: [] }]
  const callsById = new Map()

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
    const text = joinText(blocks)
    if (!text && tools.length === 0) return
    const turn = { role: 'assistant', kind: 'said', uuid: entry.uuid, timestamp: entry.timestamp, text, tools: tools.map(toolLabelOf), results: tools.map(() => null) }
    tools.forEach((tool, index) => callsById.set(tool.id, { name: tool.name, turn, index }))
    current().turns.push(turn)
  }

  function acceptOwner(entry) {
    if (entry.isMeta || entry.isCompactSummary) return
    if (!entry.toolDenialKind) recordResults(entry)
    const turn = ownerTurnOf(entry, callsById)
    if (turn) current().turns.push(turn)
  }

  // A tool's result comes back in a later entry: it completes the call on the assistant turn that made it.
  function recordResults(entry) {
    for (const block of asBlocks(entry.message?.content)) {
      const call = block.type === 'tool_result' ? callsById.get(block.tool_use_id) : undefined
      if (call) call.turn.results[call.index] = { failed: block.is_error === true, chars: charsOf(block.content) }
    }
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

function toolLabelOf(tool) {
  return tool.name === 'Bash' ? `Bash(${programsOf(tool.input?.command)})` : tool.name
}

// What a shell command ran, by program name only: its arguments are where paths and secrets live.
// The label comes from the first line that names a program. A blank line, a comment or a line that
// only sets variables is passed over; a line that opens a heredoc, a substitution or a quote ends
// the search, because what follows it is content, not commands.
function programsOf(command) {
  for (const line of String(command ?? '').split('\n')) {
    const unquoted = line.replace(QUOTED, ' ')
    const [code] = unquoted.split(CONTENT_STARTS)
    const programs = programsIn(code)
    if (programs.length > 0) return programs.slice(0, MAX_PROGRAMS).join(' && ')
    if (code !== unquoted) break
  }
  return OPAQUE
}

function programsIn(code) {
  if (code.trim().startsWith('#')) return []
  const programs = code.split(/&&|\|\||;/).map((part) => programOf(part.split('|')[0])).filter((program) => program && program !== 'cd')
  return [...new Set(programs)]
}

function programOf(simpleCommand) {
  const words = simpleCommand.trim().split(/\s+/)
  const start = words.findIndex((word) => !ASSIGNMENT.test(word) && !PREFIXES.has(word))
  if (start === -1) return null
  const [first, ...rest] = words.slice(start)
  if (first.startsWith('-')) return wrapperOf(words[start - 1])
  const program = basename(first)
  if (!PROGRAM.test(program) || BLOCK_WORDS.has(program)) return null
  if (!RUNNERS.has(program)) return program
  const stop = rest.findIndex((word) => !isSubcommand(word))
  return [program, ...rest.slice(0, stop === -1 ? MAX_SUBCOMMANDS : Math.min(stop, MAX_SUBCOMMANDS))].join(' ')
}

// A wrapper given options of its own (`sudo -u deployer npm test`) is named alone: telling its
// options from the program it runs would mean knowing every wrapper's flags.
function wrapperOf(word) {
  return PREFIXES.has(word) && PROGRAM.test(word) ? word : null
}

// A package script is named in parts (`test:unit`): it is kept when every part is a known word.
function isSubcommand(word) {
  return word.split(':').every((part) => SUBCOMMANDS.has(part))
}

function charsOf(content) {
  return asBlocks(content).reduce((total, block) => total + (block.type === 'text' ? block.text.length : 0), 0)
}

function ownerTurnOf(entry, callsById) {
  const base = { role: 'owner', uuid: entry.uuid, timestamp: entry.timestamp }
  if (entry.toolUseResult?.answers) {
    return { ...base, kind: 'answered', text: formatAnswers(entry.toolUseResult), answers: answersOf(entry.toolUseResult) }
  }
  if (entry.toolDenialKind) {
    const text = formatRejection(entry, callsById)
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

function formatRejection(entry, callsById) {
  const result = asBlocks(entry.message?.content).find((block) => block.type === 'tool_result')
  const toolName = callsById.get(result?.tool_use_id)?.name ?? 'tool call'
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
  const tools = turn.tools.length > 0 ? `\n\n_tools: ${turn.tools.map((tool, index) => tool + outcomeOf(turn.results?.[index])).join(', ')}_` : ''
  return `### assistant · ${turn.timestamp} · ${turn.uuid}\n${turn.text}${tools}`
}

function outcomeOf(result) {
  if (!result) return ''
  return result.failed ? ` [failed, ${result.chars} chars]` : ` [${result.chars} chars]`
}

/**
 * What each stage cost, per ticket, from the turns alone: a stage runs from the owner's invocation of a flow
 * stage (`tm-*`) to the next one; a harness command between them (`/compact`) does not end it. A pause over 30 minutes is idle time, kept apart. In Codex, the answers to structured questions
 * and the results of tool calls are not extracted, so what rests on them is `null` (not measured), never 0.
 */
export function costByStage(segments, { harness = 'claude' } = {}) {
  const fullyMeasured = harness !== 'codex'
  const rows = new Map()
  const rowOf = (stage) => {
    if (!rows.has(stage)) rows.set(stage, emptyCost(stage, fullyMeasured))
    return rows.get(stage)
  }
  const turns = segments.flatMap((segment) => segment.turns)
  let stage = NO_STAGE
  turns.forEach((turn, index) => {
    const invoked = turn.role === 'owner' && turn.kind === 'invoked' ? stageOf(turn.text) : null
    if (invoked?.startsWith(STAGE_PREFIX)) {
      stage = invoked
      rowOf(stage).invocations += 1
    }
    const row = rowOf(stage)
    addGap(row, turn, turns[index + 1])
    if (turn.role === 'assistant') row.tool_calls += turn.tools.length
    if (fullyMeasured) addResults(row, turn)
    if (fullyMeasured) addAnswers(row, turn)
  })
  return [...rows.values()].map(({ activeMs, idleMs, ...row }) => ({ ...row, minutes: toMinutes(activeMs), idle_minutes: toMinutes(idleMs) }))
}

function emptyCost(stage, fullyMeasured) {
  const counted = fullyMeasured ? 0 : null
  return { stage, activeMs: 0, idleMs: 0, tool_calls: 0, failed_calls: counted, result_chars: counted, invocations: 0, other_answers: counted, clarifications: counted, overrules: counted }
}

function addResults(row, turn) {
  for (const result of (turn.results ?? []).filter(Boolean)) {
    if (result.failed) row.failed_calls += 1
    row.result_chars += result.chars
  }
}

// A row is a stage on a ticket: `tm-implement 02-export`. The ticket is the one argument kept, and
// only in the shape a ticket has, so free text typed after a command never reaches the table.
function stageOf(invocation) {
  const [command, ...args] = invocation.trim().split(/\s+/)
  const name = command.replace(/^\//, '').replace(/^.*:/, '')
  const ticket = args.find((arg) => TICKET.test(arg))
  return ticket ? `${name} ${ticket}` : name
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
    renderCostTable(cost),
  ].join('\n')
}

// The table /tm-session-analyze copies into the meta-retro, and the retro script reads back from it.
export function renderCostTable(cost) {
  return [
    '## Cost by stage',
    '',
    '| Stage | Minutes | Idle minutes | Tool calls | Failed calls | Result chars | Invocations | Other answers | Clarifications | Overrules |',
    '|---|---|---|---|---|---|---|---|---|---|',
    ...cost.map((row) =>
      `| ${[row.stage, row.minutes, row.idle_minutes, row.tool_calls, row.failed_calls, row.result_chars, row.invocations, row.other_answers, row.clarifications, row.overrules].map(notMeasured).join(' | ')} |`,
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
      ? await resolveCodexTranscript({ codexHome: args.codexHome ?? process.env.CODEX_HOME ?? join(homedir(), '.codex'), ...args, passOver: (rollout) => ranOnlyTheAnalyzer(rollout, createCodexSegmenter) })
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
