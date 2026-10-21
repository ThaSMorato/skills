// The Codex side of the session extractor: finds a Codex rollout for a directory and turns it into the
// same segments the Claude Code side produces, so `/session-analyze` reads both alike. A rollout is one
// `{ timestamp, type, payload }` object per line; the format is not a stable interface (Codex says so),
// so this reads only what it needs and ignores every record it does not know.
//
// Kept: what the owner typed (`item_completed` with a `UserMessage`), the plugin stages they invoked
// (`$thasmorato-skills:tm-<stage>`), the assistant's text (`AgentMessage`) and the names of the tools
// it called. Dropped: the context Codex injects as user messages (AGENTS.md, environment, skill bodies),
// tool arguments and outputs, reasoning, and other agents. Not yet extracted, because the format does
// not show them reliably: denied approvals and answers to structured questions.

import { createReadStream, existsSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join, resolve } from 'node:path'

const STAGE_MENTION = /^\$thasmorato-skills:(tm-[a-z0-9-]+)\b\s*([\s\S]*)$/
const TOOL_CALLS = new Set(['function_call', 'custom_tool_call', 'local_shell_call', 'web_search_call', 'tool_search_call'])
const SESSION_DIRS = ['sessions', 'archived_sessions']

export function createCodexSegmenter() {
  const segments = [{ compaction: null, turns: [] }]
  let pendingTools = []

  const current = () => segments[segments.length - 1]

  function accept(record) {
    if (record.type === 'compacted') return openSegment(record)
    if (record.type === 'response_item' && TOOL_CALLS.has(record.payload?.type)) {
      pendingTools.push(record.payload.name ?? record.payload.type)
      return
    }
    const item = record.type === 'event_msg' && record.payload?.type === 'item_completed' ? record.payload.item : null
    if (item?.type === 'UserMessage') return acceptOwner(record, item)
    if (item?.type === 'AgentMessage') return acceptAssistant(record, item)
  }

  function openSegment(record) {
    flushTools(record)
    segments.push({ compaction: { trigger: 'compacted', preTokens: null, at: record.timestamp }, turns: [] })
  }

  function acceptOwner(record, item) {
    const text = textOf(item)
    if (!text) return
    const stage = text.match(STAGE_MENTION)
    const base = { role: 'owner', uuid: item.id, timestamp: record.timestamp }
    current().turns.push(stage ? { ...base, kind: 'invoked', text: [stage[1], stage[2].trim()].filter(Boolean).join(' ') } : { ...base, kind: 'said', text })
  }

  function acceptAssistant(record, item) {
    current().turns.push({ role: 'assistant', kind: 'said', uuid: item.id, timestamp: record.timestamp, text: textOf(item), tools: pendingTools })
    pendingTools = []
  }

  function flushTools(record) {
    if (pendingTools.length === 0) return
    current().turns.push(toolOnlyTurn(record.timestamp, pendingTools))
    pendingTools = []
  }

  /** The segments so far; tools called after the last message close the last one as a tool-only turn. */
  function segmentsSoFar() {
    if (pendingTools.length === 0) return segments
    const last = current()
    const closing = toolOnlyTurn(last.turns.at(-1)?.timestamp ?? '', pendingTools)
    return [...segments.slice(0, -1), { ...last, turns: [...last.turns, closing] }]
  }

  return { accept, segments: segmentsSoFar }
}

function toolOnlyTurn(timestamp, tools) {
  return { role: 'assistant', kind: 'said', uuid: `tools-${timestamp}`, timestamp, text: '', tools }
}

function textOf(item) {
  return (item.content ?? [])
    .map((part) => part.text ?? '')
    .join('\n')
    .trim()
}

/** The rollout of `cwd`: the one named by `sessionId`, else the most recent owner session there. */
export async function resolveCodexTranscript({ codexHome, cwd, sessionId }) {
  const target = canonical(cwd)
  const rollouts = SESSION_DIRS.flatMap((dir) => rolloutsUnder(join(codexHome, dir)))
  const candidates = []
  for (const path of rollouts) {
    const meta = await sessionMetaOf(path)
    if (!meta || isSubagent(meta.source) || canonical(meta.cwd ?? '') !== target) continue
    if (sessionId && meta.id !== sessionId && !path.includes(sessionId)) continue
    candidates.push(path)
  }
  if (candidates.length === 0) {
    const which = sessionId ? `session ${sessionId}` : 'a session'
    throw new Error(`No Codex ${which} for ${cwd} under ${SESSION_DIRS.map((dir) => join(codexHome, dir)).join(' or ')}`)
  }
  return candidates.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0]
}

/** The session id a rollout records, read from its first line. */
export async function codexSessionIdOf(path) {
  return (await sessionMetaOf(path))?.id
}

function rolloutsUnder(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { recursive: true })
    .filter((path) => /(^|\/)rollout-[^/]*\.jsonl$/.test(path))
    .map((path) => join(dir, path))
}

async function sessionMetaOf(path) {
  const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity })
  for await (const line of lines) {
    lines.close()
    try {
      const record = JSON.parse(line)
      return record.type === 'session_meta' ? record.payload : null
    } catch {
      return null
    }
  }
  return null
}

function isSubagent(source) {
  if (typeof source === 'string') return /sub_?agent/i.test(source)
  return source !== null && typeof source === 'object' && Object.keys(source).some((key) => /sub_?agent/i.test(key))
}

function canonical(path) {
  const absolute = resolve(path)
  try {
    return realpathSync(absolute)
  } catch {
    return absolute
  }
}
