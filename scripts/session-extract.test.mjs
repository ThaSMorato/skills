import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, utimesSync, rmSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  projectDirCandidates,
  resolveTranscript,
  createSegmenter,
  renderSegment,
  extractSession,
} from './session-extract.mjs'

const makeEntry = (overrides = {}) => ({
  type: 'user',
  uuid: 'u-1',
  timestamp: '2026-09-18T10:00:00.000Z',
  isSidechain: false,
  message: { role: 'user', content: 'owner text' },
  ...overrides,
})

const makeAssistant = (content, overrides = {}) =>
  makeEntry({ type: 'assistant', uuid: 'a-1', message: { role: 'assistant', content }, ...overrides })

const makeBoundary = (overrides = {}) => ({
  type: 'system',
  subtype: 'compact_boundary',
  uuid: 'b-1',
  timestamp: '2026-09-18T12:00:00.000Z',
  isSidechain: false,
  compactMetadata: { trigger: 'manual', preTokens: 428000 },
  ...overrides,
})

const segmentsOf = (entries) => {
  const sut = createSegmenter()
  for (const entry of entries) sut.accept(entry)
  return sut.segments()
}

describe('projectDirCandidates', () => {
  test('replaces every non-alphanumeric character first, then only slashes', () => {
    assert.deepEqual(projectDirCandidates('/Users/me/dev/my.app'), ['-Users-me-dev-my-app', '-Users-me-dev-my.app'])
  })

  test('returns one candidate when both rules agree', () => {
    assert.deepEqual(projectDirCandidates('/Users/me/dev/docs'), ['-Users-me-dev-docs'])
  })
})

describe('resolveTranscript', () => {
  let projectsRoot

  beforeEach(() => {
    projectsRoot = mkdtempSync(join(tmpdir(), 'projects-'))
  })

  afterEach(() => {
    rmSync(projectsRoot, { recursive: true, force: true })
  })

  const writeSession = (dir, id, mtimeSeconds) => {
    const path = join(projectsRoot, dir, `${id}.jsonl`)
    mkdirSync(join(projectsRoot, dir), { recursive: true })
    writeFileSync(path, '')
    utimesSync(path, mtimeSeconds, mtimeSeconds)
    return path
  }

  test('picks the most recently modified session when no id is given', () => {
    writeSession('-Users-me-app', 'older', 1_000)
    const newer = writeSession('-Users-me-app', 'newer', 2_000)

    const result = resolveTranscript({ projectsRoot, cwd: '/Users/me/app' })

    assert.equal(result, newer)
  })

  test('picks the named session when an id is given', () => {
    const older = writeSession('-Users-me-app', 'older', 1_000)
    writeSession('-Users-me-app', 'newer', 2_000)

    const result = resolveTranscript({ projectsRoot, cwd: '/Users/me/app', sessionId: 'older' })

    assert.equal(result, older)
  })

  test('falls back to the slash-only directory name', () => {
    const path = writeSession('-Users-me-my.app', 'only', 1_000)

    const result = resolveTranscript({ projectsRoot, cwd: '/Users/me/my.app' })

    assert.equal(result, path)
  })

  test('fails naming the directories it tried when none exists', () => {
    assert.throws(
      () => resolveTranscript({ projectsRoot, cwd: '/Users/me/missing' }),
      /No transcript directory for \/Users\/me\/missing.*-Users-me-missing/s,
    )
  })

  test('fails naming the session when the id does not exist', () => {
    writeSession('-Users-me-app', 'present', 1_000)

    assert.throws(
      () => resolveTranscript({ projectsRoot, cwd: '/Users/me/app', sessionId: 'absent' }),
      /No session absent/,
    )
  })
})

describe('createSegmenter — owner turns', () => {
  test('keeps what the owner typed, with uuid and timestamp', () => {
    const [segment] = segmentsOf([makeEntry({ uuid: 'u-7', timestamp: '2026-09-18T10:05:00.000Z' })])

    assert.deepEqual(segment.turns, [
      { role: 'owner', kind: 'said', uuid: 'u-7', timestamp: '2026-09-18T10:05:00.000Z', text: 'owner text' },
    ])
  })

  test('keeps text blocks of an array message', () => {
    const [segment] = segmentsOf([makeEntry({ message: { content: [{ type: 'text', text: 'from blocks' }] } })])

    assert.equal(segment.turns[0].text, 'from blocks')
  })

  test('strips injected system reminders from what the owner typed', () => {
    const content = 'before<system-reminder>injected context</system-reminder> after'

    const [segment] = segmentsOf([makeEntry({ message: { content } })])

    assert.equal(segment.turns[0].text, 'before after')
  })

  test('drops the summary written after a compaction — it is not the owner speaking', () => {
    const [segment] = segmentsOf([makeEntry({ isCompactSummary: true, message: { content: 'This session is being continued' } })])

    assert.deepEqual(segment.turns, [])
  })

  test('drops meta entries', () => {
    const [segment] = segmentsOf([makeEntry({ isMeta: true })])

    assert.deepEqual(segment.turns, [])
  })

  test('drops local command markup', () => {
    const [segment] = segmentsOf([makeEntry({ message: { content: '<command-name>/model</command-name>' } })])

    assert.deepEqual(segment.turns, [])
  })

  test('drops background task notifications — the harness speaking, not the owner', () => {
    const [segment] = segmentsOf([makeEntry({ message: { content: '<task-notification>\n<task-id>x</task-id>' } })])

    assert.deepEqual(segment.turns, [])
  })

  test('keeps a rejection made to clarify, without the harness boilerplate', () => {
    const entries = [
      makeAssistant([{ type: 'tool_use', id: 't-6', name: 'AskUserQuestion', input: {} }]),
      makeEntry({
        toolDenialKind: 'user-rejected',
        message: {
          content: [
            {
              type: 'tool_result',
              tool_use_id: 't-6',
              content: 'The user doesn\'t want to proceed with this tool use. To tell you how to proceed, the user said:\nThe user wants to clarify these questions.\n    This means they may have additional information.',
            },
          ],
        },
      }),
    ]

    const [segment] = segmentsOf(entries)

    assert.equal(segment.turns[1].text, '[rejected AskUserQuestion to clarify — the clarification is the next owner turn]')
  })

  test('drops subagent turns — the owner has no voice there', () => {
    const [segment] = segmentsOf([makeEntry({ isSidechain: true })])

    assert.deepEqual(segment.turns, [])
  })

  test('drops plain tool results', () => {
    const content = [{ type: 'tool_result', tool_use_id: 't-1', content: 'file contents' }]

    const [segment] = segmentsOf([makeEntry({ message: { content } })])

    assert.deepEqual(segment.turns, [])
  })

  test('keeps the owner answers to a structured question, with their notes', () => {
    const entry = makeEntry({
      uuid: 'u-9',
      message: { content: [{ type: 'tool_result', tool_use_id: 't-1', content: 'Your questions have been answered' }] },
      toolUseResult: {
        answers: { 'Which runtime?': 'Node' },
        annotations: { 'Which runtime?': { notes: 'no dependencies' } },
      },
    })

    const [segment] = segmentsOf([entry])

    assert.deepEqual(segment.turns, [
      {
        role: 'owner',
        kind: 'answered',
        uuid: 'u-9',
        timestamp: entry.timestamp,
        text: 'Which runtime? → Node (note: no dependencies)',
      },
    ])
  })

  test('keeps what the owner said when rejecting a tool call, naming the tool', () => {
    const entries = [
      makeAssistant([{ type: 'tool_use', id: 't-5', name: 'AskUserQuestion', input: {} }]),
      makeEntry({
        uuid: 'u-10',
        toolDenialKind: 'user-rejected',
        message: {
          content: [
            {
              type: 'tool_result',
              tool_use_id: 't-5',
              is_error: true,
              content: "The user doesn't want to proceed with this tool use. To tell you how to proceed, the user said:\nIt is not Tidy First, it is Simple Design",
            },
          ],
        },
      }),
    ]

    const [segment] = segmentsOf(entries)

    assert.deepEqual(segment.turns[1], {
      role: 'owner',
      kind: 'rejected',
      uuid: 'u-10',
      timestamp: entries[1].timestamp,
      text: '[rejected AskUserQuestion] It is not Tidy First, it is Simple Design',
    })
  })
})

describe('createSegmenter — assistant turns', () => {
  test('keeps the assistant text and only the names of the tools it called', () => {
    const content = [
      { type: 'thinking', thinking: 'private reasoning' },
      { type: 'text', text: 'I will read the plan.' },
      { type: 'tool_use', id: 't-1', name: 'Read', input: { file_path: '/secret/path' } },
      { type: 'tool_use', id: 't-2', name: 'Grep', input: { pattern: 'x' } },
    ]

    const [segment] = segmentsOf([makeAssistant(content, { uuid: 'a-3' })])

    assert.deepEqual(segment.turns, [
      { role: 'assistant', kind: 'said', uuid: 'a-3', timestamp: '2026-09-18T10:00:00.000Z', text: 'I will read the plan.', tools: ['Read', 'Grep'] },
    ])
  })

  test('keeps a tools-only assistant turn, so a look-up before a design is visible', () => {
    const [segment] = segmentsOf([makeAssistant([{ type: 'tool_use', id: 't-1', name: 'Grep', input: {} }])])

    assert.deepEqual(segment.turns[0].tools, ['Grep'])
    assert.equal(segment.turns[0].text, '')
  })

  test('drops an assistant turn that only thought', () => {
    const [segment] = segmentsOf([makeAssistant([{ type: 'thinking', thinking: 'hmm' }])])

    assert.deepEqual(segment.turns, [])
  })
})

describe('createSegmenter — segmentation', () => {
  test('starts a new segment at every compaction boundary, carrying its metadata', () => {
    const segments = segmentsOf([makeEntry({ uuid: 'u-1' }), makeBoundary(), makeEntry({ uuid: 'u-2' })])

    assert.equal(segments.length, 2)
    assert.deepEqual(segments[1].compaction, { trigger: 'manual', preTokens: 428000, at: '2026-09-18T12:00:00.000Z' })
    assert.equal(segments[1].turns[0].uuid, 'u-2')
  })

  test('gives the first segment no compaction', () => {
    const [segment] = segmentsOf([makeEntry()])

    assert.equal(segment.compaction, null)
  })

  test('ignores entry types that carry no conversation', () => {
    const [segment] = segmentsOf([
      { type: 'file-history-snapshot', snapshot: { big: 'x'.repeat(100) } },
      { type: 'system', subtype: 'turn_duration', uuid: 's-1' },
      makeEntry(),
    ])

    assert.equal(segment.turns.length, 1)
  })
})

describe('renderSegment', () => {
  test('writes frontmatter with the counts, then one heading per turn carrying uuid and timestamp', () => {
    const segment = {
      compaction: { trigger: 'auto', preTokens: 995454, at: '2026-06-12T13:04:49.715Z' },
      turns: [
        { role: 'owner', kind: 'said', uuid: 'u-1', timestamp: '2026-06-12T13:05:00.000Z', text: 'too big' },
        { role: 'assistant', kind: 'said', uuid: 'a-1', timestamp: '2026-06-12T13:06:00.000Z', text: 'splitting', tools: ['Read'] },
      ],
    }

    const result = renderSegment(segment, { sessionId: 'abc', index: 2, total: 3 })

    assert.match(result, /^---\nkind: session-segment\nsession: abc\nsegment: 2\nof: 3\n/)
    assert.match(result, /compaction_trigger: auto\npre_tokens: 995454\n/)
    assert.match(result, /owner_turns: 1\nassistant_turns: 1\n---/)
    assert.match(result, /### owner · said · 2026-06-12T13:05:00.000Z · u-1\ntoo big/)
    assert.match(result, /### assistant · 2026-06-12T13:06:00.000Z · a-1\nsplitting\n\n_tools: Read_/)
  })

  test('marks the first segment as having no compaction before it', () => {
    const result = renderSegment({ compaction: null, turns: [] }, { sessionId: 'abc', index: 1, total: 1 })

    assert.match(result, /compaction_trigger: none\npre_tokens: none\n/)
  })
})

describe('extractSession', () => {
  let workDir

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), 'extract-'))
  })

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true })
  })

  test('writes one file per segment and an index, skipping unparseable lines', async () => {
    const transcript = join(workDir, 'session-1.jsonl')
    const lines = [
      JSON.stringify(makeEntry({ uuid: 'u-1' })),
      'not json',
      JSON.stringify(makeBoundary()),
      JSON.stringify(makeEntry({ uuid: 'u-2' })),
    ]
    writeFileSync(transcript, lines.join('\n'))
    const outDir = join(workDir, 'out')

    const result = await extractSession({ transcript, outDir })

    assert.deepEqual(readdirSync(outDir).sort(), ['index.md', 'seg-01.md', 'seg-02.md'])
    assert.deepEqual(result, { sessionId: 'session-1', segments: 2, ownerTurns: 2, skippedLines: 1 })
    assert.match(readFileSync(join(outDir, 'seg-02.md'), 'utf8'), /u-2/)
    assert.match(readFileSync(join(outDir, 'index.md'), 'utf8'), /segments: 2\n/)
  })
})
