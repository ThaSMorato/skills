import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createCodexSegmenter, resolveCodexTranscript } from './session-extract-codex.mjs'
import { extractSession } from './session-extract.mjs'

// A Codex rollout is one JSON object per line: `{ timestamp, type, payload }`. What the owner typed is
// an `item_completed` event with a `UserMessage` item; the context Codex injects (AGENTS.md, the
// environment, a skill's body) arrives as user-role `response_item` messages and must not count as
// the owner. Sessions of subagents are separate files.

const at = (second) => `2026-10-20T10:00:${String(second).padStart(2, '0')}.000Z`
const said = (role, text, { id = `${role}-${text.length}`, second = 0 } = {}) => ({
  timestamp: at(second),
  type: 'event_msg',
  payload: {
    type: 'item_completed',
    item: { type: role === 'owner' ? 'UserMessage' : 'AgentMessage', id, content: [{ type: role === 'owner' ? 'text' : 'Text', text }] },
  },
})
const toolCall = (name, kind = 'function_call') => ({ timestamp: at(30), type: 'response_item', payload: { type: kind, name, call_id: 'c' } })
const injected = (text) => ({ timestamp: at(1), type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] } })
const compacted = () => ({ timestamp: at(40), type: 'compacted', payload: { message: '' } })

const segmentsOf = (records) => {
  const sut = createCodexSegmenter()
  for (const record of records) sut.accept(record)
  return sut.segments()
}
const turnsOf = (records) => segmentsOf(records).flatMap((segment) => segment.turns)

describe('createCodexSegmenter', () => {
  test('what the owner typed is an owner turn, with its item id and time', () => {
    const [turn] = turnsOf([said('owner', 'fix the login', { id: 'item-7', second: 5 })])

    assert.deepEqual(turn, { role: 'owner', kind: 'said', uuid: 'item-7', timestamp: at(5), text: 'fix the login' })
  })

  test('a plugin stage typed by the owner is an invocation, with its argument', () => {
    const [turn] = turnsOf([said('owner', '$thasmorato-skills:tm-plan 03-login')])

    assert.deepEqual({ kind: turn.kind, text: turn.text }, { kind: 'invoked', text: 'tm-plan 03-login' })
  })

  test('context Codex injects as a user message is not the owner', () => {
    assert.deepEqual(turnsOf([injected('<environment_context>cwd</environment_context>'), injected('<skill>body</skill>')]), [])
  })

  test('an assistant turn names the tools called since the previous one', () => {
    const turns = turnsOf([toolCall('exec_command'), toolCall('apply_patch', 'custom_tool_call'), said('assistant', 'done')])

    assert.deepEqual(turns.map(({ role, text, tools }) => ({ role, text, tools })), [
      { role: 'assistant', text: 'done', tools: ['exec_command', 'apply_patch'] },
    ])
  })

  test('tools called after the last message close the segment as a tool-only turn', () => {
    const turns = turnsOf([said('assistant', 'reading'), toolCall('exec_command')])

    assert.deepEqual(turns.at(-1).tools, ['exec_command'])
  })

  test('a compaction opens a new segment', () => {
    const segments = segmentsOf([said('owner', 'one'), compacted(), said('owner', 'two')])

    assert.deepEqual(
      segments.map((segment) => ({ trigger: segment.compaction?.trigger ?? null, texts: segment.turns.map((turn) => turn.text) })),
      [
        { trigger: null, texts: ['one'] },
        { trigger: 'compacted', texts: ['two'] },
      ],
    )
  })
})

function aCodexHome(sessions) {
  const home = mkdtempSync(join(tmpdir(), 'tm-codex-sessions-'))
  sessions.forEach(({ dir = 'sessions/2026/10/20', id, cwd, source = 'cli', mtime = 1 }) => {
    mkdirSync(join(home, dir), { recursive: true })
    const path = join(home, dir, `rollout-2026-10-20T10-00-00-${id}.jsonl`)
    const meta = { timestamp: at(0), type: 'session_meta', payload: { id, cwd, source } }
    writeFileSync(path, `${JSON.stringify(meta)}\n${JSON.stringify(said('owner', `hello from ${id}`))}\n`)
    utimesSync(path, mtime, mtime)
  })
  return home
}

describe('resolveCodexTranscript', () => {
  test('takes the most recent session started in the directory', async () => {
    const codexHome = aCodexHome([
      { id: 'old', cwd: '/work/app', mtime: 1 },
      { id: 'new', cwd: '/work/app', mtime: 2 },
      { id: 'elsewhere', cwd: '/work/other', mtime: 3 },
    ])

    assert.match(await resolveCodexTranscript({ codexHome, cwd: '/work/app' }), /-new\.jsonl$/)
  })

  test('skips the sessions of subagents', async () => {
    const codexHome = aCodexHome([
      { id: 'main', cwd: '/work/app', mtime: 1 },
      { id: 'child', cwd: '/work/app', source: { subagent: { parent_thread_id: 'main' } }, mtime: 2 },
    ])

    assert.match(await resolveCodexTranscript({ codexHome, cwd: '/work/app' }), /-main\.jsonl$/)
  })

  test('finds archived sessions too', async () => {
    const codexHome = aCodexHome([{ id: 'kept', cwd: '/work/app', dir: 'archived_sessions' }])

    assert.match(await resolveCodexTranscript({ codexHome, cwd: '/work/app' }), /-kept\.jsonl$/)
  })

  test('matches the directory through a symlink', async () => {
    const real = mkdtempSync(join(tmpdir(), 'tm-real-'))
    const link = `${real}-link`
    symlinkSync(real, link)
    const codexHome = aCodexHome([{ id: 'linked', cwd: real }])

    assert.match(await resolveCodexTranscript({ codexHome, cwd: link }), /-linked\.jsonl$/)
  })

  test('takes a session by id', async () => {
    const codexHome = aCodexHome([
      { id: 'wanted', cwd: '/work/app', mtime: 1 },
      { id: 'latest', cwd: '/work/app', mtime: 2 },
    ])

    assert.match(await resolveCodexTranscript({ codexHome, cwd: '/work/app', sessionId: 'wanted' }), /-wanted\.jsonl$/)
  })

  test('says where it looked when no session matches', async () => {
    const codexHome = aCodexHome([{ id: 'x', cwd: '/work/other' }])

    await assert.rejects(resolveCodexTranscript({ codexHome, cwd: '/work/app' }), new RegExp(`/work/app.*${codexHome}`))
  })
})

test('a Codex session extracts to the same segment files as a Claude one', async () => {
  const codexHome = aCodexHome([{ id: 'sess-1', cwd: '/work/app' }])
  const transcript = await resolveCodexTranscript({ codexHome, cwd: '/work/app' })
  const outDir = mkdtempSync(join(tmpdir(), 'tm-out-'))

  const result = await extractSession({ transcript, outDir, harness: 'codex' })

  assert.deepEqual(
    { result, files: readdirSync(outDir).sort(), session: readFileSync(join(outDir, 'seg-01.md'), 'utf8').match(/^session: (.*)$/m)[1] },
    { result: { sessionId: 'sess-1', segments: 1, ownerTurns: 1, skippedLines: 0 }, files: ['index.md', 'seg-01.md'], session: 'sess-1' },
  )
})
