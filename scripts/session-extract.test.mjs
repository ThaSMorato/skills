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
  costByStage,
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

describe('createSegmenter: owner turns', () => {
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

  test('drops the summary written after a compaction: it is not the owner speaking', () => {
    const [segment] = segmentsOf([makeEntry({ isCompactSummary: true, message: { content: 'This session is being continued' } })])

    assert.deepEqual(segment.turns, [])
  })

  test('drops meta entries', () => {
    const [segment] = segmentsOf([makeEntry({ isMeta: true })])

    assert.deepEqual(segment.turns, [])
  })

  test('keeps a slash command the owner ran, with its arguments', () => {
    const content = '<command-message>plan-validate</command-message>\n <command-name>/plan-validate</command-name>\n <command-args>03-checkout</command-args>'

    const [segment] = segmentsOf([makeEntry({ uuid: 'u-3', message: { content } })])

    assert.deepEqual(segment.turns, [
      { role: 'owner', kind: 'invoked', uuid: 'u-3', timestamp: '2026-09-18T10:00:00.000Z', text: '/plan-validate 03-checkout' },
    ])
  })

  test('keeps a slash command with no arguments as its bare name', () => {
    const content = '<command-name>/compact</command-name>\n <command-message>compact</command-message>\n <command-args></command-args>'

    const [segment] = segmentsOf([makeEntry({ message: { content } })])

    assert.equal(segment.turns[0].text, '/compact')
  })

  test('drops the output and caveat of a local command: the harness speaking, not the owner', () => {
    const [segment] = segmentsOf([
      makeEntry({ message: { content: '<local-command-stdout>Compacted</local-command-stdout>' } }),
      makeEntry({ message: { content: '<local-command-caveat>Caveat: generated by local commands</local-command-caveat>' } }),
    ])

    assert.deepEqual(segment.turns, [])
  })

  test('drops background task notifications: the harness speaking, not the owner', () => {
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

    assert.equal(segment.turns[1].text, '[rejected AskUserQuestion to clarify; the clarification is the next owner turn]')
  })

  test('drops subagent turns: the owner has no voice there', () => {
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
        answers: [{ question: 'Which runtime?', answer: 'Node', offered: [], recommended: null }],
      },
    ])
  })

  test('keeps the options a structured question offered, so an overruled recommendation is visible', () => {
    const entry = makeEntry({
      message: { content: [{ type: 'tool_result', tool_use_id: 't-1', content: 'Your questions have been answered' }] },
      toolUseResult: {
        questions: [
          {
            question: 'How fine?',
            multiSelect: true,
            options: [{ label: '1 SI (Recommended)' }, { label: 'Merge SI-2' }, { label: 'Merge SI-3' }],
          },
        ],
        answers: { 'How fine?': 'Merge SI-2, Merge SI-3' },
      },
    })

    const [segment] = segmentsOf([entry])

    assert.equal(segment.turns[0].text, 'How fine? → Merge SI-2, Merge SI-3\n  offered (multi-select): 1 SI (Recommended) · Merge SI-2 · Merge SI-3')
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

describe('createSegmenter: assistant turns', () => {
  test('keeps the assistant text and only the names of the tools it called', () => {
    const content = [
      { type: 'thinking', thinking: 'private reasoning' },
      { type: 'text', text: 'I will read the plan.' },
      { type: 'tool_use', id: 't-1', name: 'Read', input: { file_path: '/secret/path' } },
      { type: 'tool_use', id: 't-2', name: 'Grep', input: { pattern: 'x' } },
    ]

    const [segment] = segmentsOf([makeAssistant(content, { uuid: 'a-3' })])

    assert.deepEqual(segment.turns, [
      { role: 'assistant', kind: 'said', uuid: 'a-3', timestamp: '2026-09-18T10:00:00.000Z', text: 'I will read the plan.', tools: ['Read', 'Grep'], results: [null, null] },
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

describe('createSegmenter: segmentation', () => {
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

    const { cost, ...result } = await extractSession({ transcript, outDir })

    assert.deepEqual(readdirSync(outDir).sort(), ['index.md', 'seg-01.md', 'seg-02.md'])
    assert.deepEqual(result, { sessionId: 'session-1', segments: 2, ownerTurns: 2, skippedLines: 1 })
    assert.match(readFileSync(join(outDir, 'seg-02.md'), 'utf8'), /u-2/)
    assert.match(readFileSync(join(outDir, 'index.md'), 'utf8'), /segments: 2\n/)
  })
})

const queued = (prompt, { commandMode = 'prompt', uuid = 'q-1', timestamp = '2026-09-18T10:05:00.000Z' } = {}) => ({
  type: 'attachment',
  uuid,
  timestamp,
  isSidechain: false,
  attachment: { type: 'queued_command', commandMode, prompt, timestamp },
})

describe('createSegmenter: messages the owner sent mid-turn', () => {
  test('a message queued while the assistant worked is an owner turn, with its uuid and time', () => {
    const [segment] = segmentsOf([queued('stop, use the other table', { uuid: 'q-7' })])

    assert.deepEqual(segment.turns, [{ role: 'owner', kind: 'queued', uuid: 'q-7', timestamp: '2026-09-18T10:05:00.000Z', text: 'stop, use the other table' }])
  })

  test('a slash command queued mid-turn is an invocation', () => {
    const [segment] = segmentsOf([queued('/thasmorato-skills:tm-review main')])

    assert.deepEqual({ kind: segment.turns[0].kind, text: segment.turns[0].text }, { kind: 'invoked', text: '/thasmorato-skills:tm-review main' })
  })

  test('a task notification queued by the harness is not the owner', () => {
    const [segment] = segmentsOf([queued('<task-notification>done</task-notification>', { commandMode: 'task-notification' })])

    assert.deepEqual(segment.turns, [])
  })
})

// The extract kept only tool names, so a mistake the agent made and repaired itself (a red test, a
// failed type check) left no trace, and a 50k-character read looked like a cheap one. Each call now
// carries the program a Bash call ran, whether it failed and how much came back; never the content.
describe('createSegmenter: what a tool call ran and cost', () => {
  const bash = (command, id = 't-1') => ({ type: 'tool_use', id, name: 'Bash', input: { command } })
  const resultOf = (id, content, extra = {}) => makeEntry({ uuid: `r-${id}`, message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content, ...extra }] } })
  const labelOf = (command) => segmentsOf([makeAssistant([bash(command)])])[0].turns[0].tools[0]

  for (const [command, label] of [
    ['npm test', 'Bash(npm test)'],
    ['API_KEY=sk-live-123 npm run test:unit -- --grep "billing secret"', 'Bash(npm run test:unit)'],
    ['cd /repo/private && npx tsc --noEmit | tail -5', 'Bash(npx tsc)'],
    ['/usr/local/bin/pytest tests/billing -k invoice', 'Bash(pytest)'],
    ['grep -rn hunter2 src', 'Bash(grep)'],
    ['git add -A && git commit -m "fix the leak of token abc"', 'Bash(git add && git commit)'],
    ["cat > .env <<'EOF'\nPASSWORD hunter2\nEOF", 'Bash(cat)'],
    ['"$(cat run.sh)" --now', 'Bash(opaque)'],
    ['TOKEN=sk-live-123; OUT=/tmp/private/secretdir; npm test', 'Bash(npm test)'],
    ['git commit -m "fix; password hunter2" && npm test', 'Bash(git commit && npm test)'],
    ['echo $(cat a; secretword b)', 'Bash(echo)'],
    ["sed -i '' 's|a; live && PR|b|' file", 'Bash(sed)'],
  ]) {
    test(`a Bash call is named with its program, never its arguments: ${label}`, () => {
      assert.equal(labelOf(command), label)
    })
  }

  for (const [command, label] of [
    ['git checkout acme-client-payroll', 'Bash(git checkout)'],
    ['git push origin feature/acme-payroll', 'Bash(git push)'],
    ['git clone mytoken', 'Bash(git clone)'],
    ['docker login hunter2pass', 'Bash(docker login)'],
    ['cargo login abc123', 'Bash(cargo login)'],
    ['npm install acme-internal-sdk', 'Bash(npm install)'],
    ['poetry add privatelib', 'Bash(poetry add)'],
    ['npx secretpkgname', 'Bash(npx)'],
    ['make secret-target', 'Bash(make)'],
    ['npm run deploy:prod-acme', 'Bash(npm run)'],
    ['gh pr view 83 --json state', 'Bash(gh pr view)'],
    ['docker compose up -d', 'Bash(docker compose up)'],
    ['uv run pytest tests/billing', 'Bash(uv run pytest)'],
    ['make test', 'Bash(make test)'],
  ]) {
    test(`after a runner only a known subcommand is kept, never the argument that follows it: ${command}`, () => {
      assert.equal(labelOf(command), label)
    })
  }

  for (const [command, label] of [
    ['\nnpm test', 'Bash(npm test)'],
    ['NODE_ENV=test\nnpm test', 'Bash(npm test)'],
    ['# run the unit tests\nnpm test', 'Bash(npm test)'],
    ['sudo npm test', 'Bash(npm test)'],
    ['time npm test', 'Bash(npm test)'],
    ['env CI=1 npm test', 'Bash(npm test)'],
    ['sudo -u deployer npm test', 'Bash(sudo)'],
    ['if true; then npm test; fi', 'Bash(true && npm test)'],
    ['for f in *.md; do wc -l "$f"; done', 'Bash(wc)'],
  ]) {
    test(`the program is found behind a blank line, a variable, a wrapper or a shell keyword: ${JSON.stringify(command)}`, () => {
      assert.equal(labelOf(command), label)
    })
  }

  test('a call records whether it failed and how many characters came back, never the content', () => {
    const entries = [
      makeAssistant([bash('npm test', 't-1'), { type: 'tool_use', id: 't-2', name: 'Read', input: { file_path: '/secret/path' } }]),
      resultOf('t-1', 'FAIL src/a.test.ts', { is_error: true }),
      resultOf('t-2', [{ type: 'text', text: 'line one' }, { type: 'text', text: 'line two' }]),
    ]

    const [segment] = segmentsOf(entries)

    assert.deepEqual(segment.turns, [
      { role: 'assistant', kind: 'said', uuid: 'a-1', timestamp: '2026-09-18T10:00:00.000Z', text: '', tools: ['Bash(npm test)', 'Read'], results: [{ failed: true, chars: 18 }, { failed: false, chars: 16 }] },
    ])
  })

  test('a call the owner rejected is the owner speaking, not a call that failed', () => {
    const entries = [
      makeAssistant([{ type: 'tool_use', id: 't-9', name: 'Edit', input: {} }]),
      makeEntry({
        uuid: 'u-9',
        toolDenialKind: 'user_reject',
        message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't-9', is_error: true, content: 'The user rejected it. the user said: not that file' }] },
      }),
    ]

    const [segment] = segmentsOf(entries)

    assert.deepEqual({ results: segment.turns[0].results, owner: segment.turns[1].kind }, { results: [null], owner: 'rejected' })
  })

  test('the segment shows each call with its outcome, so an error then a retry can be read', () => {
    const turn = { role: 'assistant', kind: 'said', uuid: 'a-1', timestamp: '2026-06-12T13:06:00.000Z', text: 'running', tools: ['Bash(npm test)', 'Edit', 'Bash(npm test)', 'Read'], results: [{ failed: true, chars: 3120 }, { failed: false, chars: 40 }, { failed: false, chars: 900 }, null] }

    const result = renderSegment({ compaction: null, turns: [turn] }, { sessionId: 's', index: 1, total: 1 })

    assert.match(result, /_tools: Bash\(npm test\) \[failed, 3120 chars\], Edit \[40 chars\], Bash\(npm test\) \[900 chars\], Read_/)
  })
})
const at = (minute) => `2026-09-18T10:${String(minute).padStart(2, '0')}:00.000Z`
const owner = (kind, text, minute, extra = {}) => ({ role: 'owner', kind, uuid: `o-${minute}`, timestamp: at(minute), text, ...extra })
const assistant = (minute, tools = [], results) => ({ role: 'assistant', kind: 'said', uuid: `a-${minute}`, timestamp: at(minute), text: 'ok', tools, ...(results ? { results } : {}) })
const answered = (answer, offered, minute) => owner('answered', '', minute, { answers: [{ question: 'Gear?', answer, offered, recommended: offered.find((label) => label.endsWith('(Recommended)')) ?? null }] })
const costOf = (turns, options) => costByStage([{ compaction: null, turns }], options)
const stage = (cost, name) => cost.find((row) => row.stage === name)

describe('costByStage', () => {
  test('each stage gets the minutes and tool calls from its invocation until the next one', () => {
    const cost = costOf([
      owner('invoked', '/thasmorato-skills:tm-plan 02-export', 0),
      assistant(4, ['Read', 'Grep']),
      assistant(10, ['Write']),
      owner('invoked', '/thasmorato-skills:tm-plan-validate 02-export', 12),
      assistant(15, ['Read']),
    ])

    assert.deepEqual(
      [stage(cost, 'tm-plan 02-export'), stage(cost, 'tm-plan-validate 02-export')].map(({ minutes, tool_calls, invocations }) => ({ minutes, tool_calls, invocations })),
      [{ minutes: 12, tool_calls: 3, invocations: 1 }, { minutes: 3, tool_calls: 1, invocations: 1 }],
    )
  })

  test('a pause longer than 30 minutes counts as idle, not as the stage working', () => {
    const cost = costOf([owner('invoked', '/tm-implement 02-export', 0), assistant(5), assistant(55)])

    assert.deepEqual({ minutes: stage(cost, 'tm-implement 02-export').minutes, idle: stage(cost, 'tm-implement 02-export').idle_minutes }, { minutes: 5, idle: 50 })
  })

  const twoTickets = () => costOf([owner('invoked', '/tm-implement 01-read-model', 0), assistant(4, ['Read']), owner('invoked', '/thasmorato-skills:tm-implement ledger/02-export continuous', 5), assistant(7, ['Read', 'Edit'])])

  test('a stage run on two tickets is two rows, each named with the ticket its invocation gave', () => {
    assert.deepEqual(
      twoTickets().map(({ stage: name, tool_calls, invocations }) => ({ name, tool_calls, invocations })),
      [{ name: 'tm-implement 01-read-model', tool_calls: 1, invocations: 1 }, { name: 'tm-implement ledger/02-export', tool_calls: 2, invocations: 1 }],
    )
  })

  test('an argument that is not a ticket stays out of the row: free text, a fixed point, a mode', () => {
    const cost = costOf([owner('invoked', '/tm-interview the acme-payroll export for client 7', 0), assistant(1), owner('invoked', '/tm-review main', 2), assistant(3)])

    assert.deepEqual(cost.map((row) => row.stage), ['tm-interview', 'tm-review'])
  })

  test('the same stage invoked again adds to its row', () => {
    const cost = costOf([owner('invoked', '/tm-plan 02', 0), assistant(1), owner('invoked', '/tm-plan 02', 2), assistant(3)])

    assert.equal(stage(cost, 'tm-plan').invocations, 2)
  })

  test('an answer outside the options offered is counted as Other', () => {
    const cost = costOf([owner('invoked', '/tm-flow', 0), answered('Small, but skip the trace', ['Small (Recommended)', 'Feature'], 1)])

    assert.equal(stage(cost, 'tm-flow').other_answers, 1)
  })

  test('an offered answer other than the recommended one is an overrule', () => {
    const cost = costOf([owner('invoked', '/tm-flow', 0), answered('Feature', ['Small (Recommended)', 'Feature'], 1)])

    assert.deepEqual({ overrules: stage(cost, 'tm-flow').overrules, other: stage(cost, 'tm-flow').other_answers }, { overrules: 1, other: 0 })
  })

  test('a multi-select answer of offered options is not Other', () => {
    const cost = costOf([owner('invoked', '/tm-flow', 0), answered('Merge SI-2, Merge SI-3', ['1 SI (Recommended)', 'Merge SI-2', 'Merge SI-3'], 1)])

    assert.deepEqual({ other: stage(cost, 'tm-flow').other_answers, overrules: stage(cost, 'tm-flow').overrules }, { other: 0, overrules: 1 })
  })

  test('a question rejected to clarify is a clarification', () => {
    const cost = costOf([owner('invoked', '/tm-flow', 0), owner('rejected', '[rejected AskUserQuestion to clarify]', 1, { clarify: true })])

    assert.equal(stage(cost, 'tm-flow').clarifications, 1)
  })

  test('a harness command such as /compact does not open a stage: the work goes on in the one before', () => {
    const cost = costOf([owner('invoked', '/thasmorato-skills:tm-implement 02', 0), assistant(2), owner('invoked', '/compact', 4), assistant(6, ['Read'])])

    assert.deepEqual(cost.map(({ stage: name, minutes, tool_calls, invocations }) => ({ name, minutes, tool_calls, invocations })), [{ name: 'tm-implement', minutes: 6, tool_calls: 1, invocations: 1 }])
  })

  test('work before any invocation is its own row', () => {
    assert.deepEqual(costOf([owner('said', 'hi', 0), assistant(2, ['Read'])]).map((row) => row.stage), ['(no stage)'])
  })

  test('in Codex, what a rollout does not record is not measured rather than zero', () => {
    const cost = costOf([owner('invoked', 'tm-plan 02', 0), assistant(1, ['exec(exec_command)'])], { harness: 'codex' })
    const { other_answers, overrules, failed_calls, result_chars } = stage(cost, 'tm-plan')

    assert.deepEqual({ other_answers, overrules, failed_calls, result_chars }, { other_answers: null, overrules: null, failed_calls: null, result_chars: null })
  })

  test('each stage adds up the calls that failed and the characters its results brought back', () => {
    const cost = costOf([
      owner('invoked', '/tm-implement 02-export', 0),
      assistant(1, ['Bash(npm test)', 'Read'], [{ failed: true, chars: 3000 }, { failed: false, chars: 48000 }]),
      assistant(2, ['Bash(npm test)', 'Edit'], [{ failed: false, chars: 900 }, null]),
    ])

    assert.deepEqual({ failed: stage(cost, 'tm-implement 02-export').failed_calls, chars: stage(cost, 'tm-implement 02-export').result_chars }, { failed: 1, chars: 51900 })
  })
})

describe('extractSession: cost', () => {
  test('the index carries the cost by stage, and the summary returns it', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cost-'))
    const transcript = join(dir, 'sess-c.jsonl')
    const lines = [
      makeEntry({ uuid: 'u-1', timestamp: at(0), message: { content: '<command-name>/tm-plan</command-name><command-args>02</command-args>' } }),
      makeAssistant([{ type: 'tool_use', id: 't-1', name: 'Read', input: {} }], { timestamp: at(6) }),
    ]
    writeFileSync(transcript, lines.map((line) => JSON.stringify(line)).join('\n'))

    const result = await extractSession({ transcript, outDir: join(dir, 'out') })

    assert.deepEqual(
      {
        cost: result.cost.map(({ stage: name, minutes, tool_calls }) => ({ name, minutes, tool_calls })),
        table: /^## Cost by stage$/m.test(readFileSync(join(dir, 'out', 'index.md'), 'utf8')),
        columns: /^\| Stage \| Minutes \| Idle minutes \| Tool calls \| Failed calls \| Result chars \| Invocations \|/m.test(readFileSync(join(dir, 'out', 'index.md'), 'utf8')),
      },
      { cost: [{ name: 'tm-plan', minutes: 6, tool_calls: 1 }], table: true, columns: true },
    )
  })
})
