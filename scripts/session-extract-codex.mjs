#!/usr/bin/env node
// Codex JSONL adapter. Discards instructions, tool arguments/results, reasoning and child sessions.
import { createReadStream, readdirSync, openSync, readSync, closeSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import { createSegmenter, renderSegment } from './session-extract.mjs'

export function normalizeCodex(entry, line = 0) {
  const p = entry.payload ?? {}
  const base = { timestamp: entry.timestamp, uuid: p.id ?? `line-${line}` }
  if (entry.type === 'compacted') return { ...base, type: 'system', subtype: 'compact_boundary' }
  if (entry.type !== 'response_item') return null
  if (p.type === 'function_call' || p.type === 'custom_tool_call') return { ...base, type: 'assistant', message: { content: [{ type: 'tool_use', id: p.call_id, name: p.name }] } }
  if (p.type !== 'message' || !['user','assistant'].includes(p.role)) return null
  const text = (p.content ?? []).filter(b => ['input_text','output_text','text'].includes(b.type)).map(b => b.text ?? '').join('\n').trim()
  if (!text || /^\s*<(environment_context|permissions|user_instructions|INSTRUCTIONS|turn_aborted)\b/i.test(text) || text.startsWith('# AGENTS.md instructions')) return null
  return { ...base, type: p.role, message: { content: text } }
}
export function resolveCodexTranscript({ sessionsRoot = join(homedir(), '.codex/sessions'), cwd, sessionId }) {
  const files = readdirSync(sessionsRoot, { recursive: true }).filter(f => f.endsWith('.jsonl')).map(f => join(sessionsRoot, f))
  const candidates = files.filter(file => {
    // session_meta is first; do not read an entire large transcript just to discover it.
    const fd = openSync(file, 'r')
    const buffer = Buffer.alloc(65536)
    let length
    try { length = readSync(fd, buffer, 0, buffer.length, 0) } finally { closeSync(fd) }
    const fdText = buffer.subarray(0, length).toString('utf8').split('\n', 1)[0]
    let entry
    try { entry = JSON.parse(fdText) } catch { return false }
    const p = entry.payload ?? {}
    if (entry.type !== 'session_meta' || p.cwd !== cwd || (typeof p.source === 'object' && p.source !== null)) return false
    return !sessionId || p.id === sessionId || basename(file, '.jsonl') === sessionId
  }).sort((a,b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  if (!candidates.length) throw new Error(`No Codex session for ${cwd}${sessionId ? ` (${sessionId})` : ''}`)
  return candidates[0]
}
export async function extractCodexSession({ transcript, outDir }) {
  const segmenter = createSegmenter(); let skippedLines = 0; let lineNumber = 0
  let sessionId = basename(transcript, '.jsonl')
  for await (const line of createInterface({ input: createReadStream(transcript), crlfDelay: Infinity })) {
    lineNumber++
    if (!line.trim()) continue
    let entry
    try { entry = JSON.parse(line) } catch { skippedLines++; continue }
    if (entry.type === 'session_meta') {
      if (typeof entry.payload?.source === 'object' && entry.payload.source !== null) throw new Error('Subagent sessions are not owner evidence')
      sessionId = entry.payload?.id ?? sessionId
    }
    const normalized = normalizeCodex(entry, lineNumber)
    if (normalized) segmenter.accept(normalized)
  }
  const segments = segmenter.segments()
  mkdirSync(outDir, { recursive: true })
  const rows = []
  segments.forEach((segment, i) => {
    const name = `seg-${String(i+1).padStart(2,'0')}.md`
    const text = renderSegment(segment, { sessionId, index: i+1, total: segments.length, harness: 'codex' })
    writeFileSync(join(outDir, name), text)
    rows.push(`| ${i+1} | ${name} | ${segment.turns.filter(t => t.role === 'owner').length} |`)
  })
  writeFileSync(join(outDir, 'index.md'), `---\nkind: session-index\nharness: codex\nsession: ${sessionId}\nsegments: ${segments.length}\n---\n\n| Segment | File | Owner turns |\n|---|---|---|\n${rows.join('\n')}\n`)
  return { sessionId, harness: 'codex', segments: segments.length, ownerTurns: segments.flatMap(s => s.turns).filter(t => t.role === 'owner').length, skippedLines }
}
