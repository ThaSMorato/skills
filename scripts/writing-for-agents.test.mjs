import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { KNOWLEDGE_SKILLS } from './skill-kinds.mjs'

// Several stages write files an agent loads: the guidelines router and the lines it plants in
// CLAUDE.md and AGENTS.md, the stack and test guides, a rule a retro proposes. They had no writing
// standard to load: the rules sat in docs/anatomy/skill-anatomy.md, which guides this plugin's own
// authors and does not ship. They are a reference skill now, and the anatomy points at it.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const LOAD = /[Cc]all the Skill tool with `thasmorato-skills:writing-for-agents`/

test('the writing standard for agent documents is an open reference skill the plugin ships', () => {
  assert.deepEqual(
    { open: KNOWLEDGE_SKILLS.includes('writing-for-agents'), listed: JSON.parse(read('.claude-plugin/plugin.json')).skills.includes('./skills/writing-for-agents') },
    { open: true, listed: true },
  )
})

test('the skill holds every rule a writer of an agent document applies, each under its own heading', () => {
  const skill = read('skills/writing-for-agents/SKILL.md')
  const headings = ['## Two loads', '## Pointers', '## Where each piece sits', '## Steps end on a completion criterion', '## The tests for a sentence', '## Wording', '## Steering files']
  const rules = ['**Context load**', '**Cognitive load**', '**One trigger per branch.**', '**Progressive disclosure**', '**Co-locate**', '**Sprawl**', '**No-op**', '**Cache of the environment**', '**Single source of truth**', '**Relevance**', '**Wrong home**', '**Write the positive.**', '**Leading words.**', 'becomes a check']

  assert.deepEqual([...headings, ...rules].filter((rule) => !skill.includes(rule)), [])
})

test('the skill anatomy keeps the mechanics of this plugin and points at the skill for the writing', () => {
  const anatomy = read('docs/anatomy/skill-anatomy.md')
  const skillsOwnTerms = [/no-op/i, /cache of the environment/i, /single source of truth/i, /leading word/i, /write the positive/i, /progressive disclosure/i, /co-locate/i, /sprawl/i, /prohibition/i]

  assert.deepEqual(
    {
      points: anatomy.includes('skills/writing-for-agents/SKILL.md'),
      keepsMechanics: ['disable-model-invocation', 'KNOWLEDGE_SKILLS', 'claude plugin eval', 'no-em-dash.test.mjs'].filter((mechanic) => !anatomy.includes(mechanic)),
      restates: skillsOwnTerms.filter((term) => term.test(anatomy)).map(String),
    },
    { points: true, keepsMechanics: [], restates: [] },
  )
})

test('a near miss sits at the boundary: a document in the repository, written for people', () => {
  assert.match(read('evals/writing-for-agents-near-miss/prompt.md'), /README[^\n]*people/)
})

test('every stage that writes a document an agent loads calls the skill', () => {
  const writers = ['agents/guideline-generator.md', 'skills/generate-stack-guide/SKILL.md', 'skills/generate-test-guide/SKILL.md', 'skills/retro/SKILL.md', 'commands/tm-session-analyze.md']

  assert.deepEqual(
    { silent: writers.filter((path) => !LOAD.test(read(path))), agentHasTheTool: /^tools: .*\bSkill\b/m.test(read('agents/guideline-generator.md')) },
    { silent: [], agentHasTheTool: true },
  )
})

test('session-analyze reads the steering files of both scopes for no-ops and for rules in the wrong home', () => {
  const steering = read('commands/tm-session-analyze.md').split(/^## /m).find((section) => /^3c\. The steering files/.test(section)) ?? ''

  assert.deepEqual(
    {
      bothScopes: ['`CLAUDE.md`', '`AGENTS.md`', '`~/.claude/CLAUDE.md`'].filter((file) => !steering.includes(file)),
      noOp: /no-op/i.test(steering),
      wrongHome: /review standard[^\n]*check|check[^\n]*review standard/.test(steering),
      loads: LOAD.test(steering),
      category: /\*\*Steering files\*\*/.test(read('templates/meta-retro.md')),
    },
    { bothScopes: [], noOp: true, wrongHome: true, loads: true, category: true },
  )
})

test('a personal steering file is cited by line number, never quoted into a report that lives in the project', () => {
  const steering = read('commands/tm-session-analyze.md').split(/^## /m).find((section) => /^3c\. The steering files/.test(section)) ?? ''

  assert.deepEqual(
    {
      personalFiles: ['`~/.claude/CLAUDE.md`', '`CLAUDE.local.md`', '`~/.codex/AGENTS.md`'].filter((file) => !steering.includes(file)),
      neverQuoted: /by file and line number, never quoted or paraphrased/.test(steering),
      template: /by line number, never quoted/.test(read('templates/meta-retro.md')),
      lens: /by line number, never quoted/.test(read('skills/retro/environment.md')),
    },
    { personalFiles: [], neverQuoted: true, template: true, lens: true },
  )
})

test('an instruction the session never exercised is listed, not failed as a no-op', () => {
  const steering = read('commands/tm-session-analyze.md').split(/^## /m).find((section) => /^3c\. The steering files/.test(section)) ?? ''

  assert.deepEqual(
    {
      failsTheUntriggered: /nothing in (this session|scope) (ever )?triggered it/.test(steering + read('skills/retro/environment.md')),
      listed: /\*\*Not exercised\*\*/.test(steering),
      doneWhen: /Done when[^\n]*passed, is a finding or is listed as not exercised/.test(steering),
      lens: /not exercised/.test(read('skills/retro/environment.md')),
    },
    { failsTheUntriggered: false, listed: true, doneWhen: true, lens: true },
  )
})

test('the steering files read are the ones the harness of the session loaded', () => {
  const steering = read('commands/tm-session-analyze.md').split(/^## /m).find((section) => /^3c\. The steering files/.test(section)) ?? ''

  assert.deepEqual(['**Claude Code**', '`.claude/CLAUDE.md`', '`@path`', '**Codex**', '`AGENTS.md`'].filter((name) => !steering.includes(name)), [])
})

test('a query that found nothing is not read as a failed call', () => {
  assert.match(read('agents/session-segment-analyst.md'), /`grep`[^\n]*found nothing[^\n]*not a failure/)
})

test('the analyst reads a failed call the agent then repaired as a signal, and judges tool economy on what came back', () => {
  const analyst = read('agents/session-segment-analyst.md')
  const command = read('commands/tm-session-analyze.md')

  assert.deepEqual(
    {
      errorThenRetry: /error, then retry/.test(analyst) && /error, then retry/.test(command),
      signal: /signal: navigation \| automated-checks \| tool-economy \| information-access/.test(analyst),
      size: /\[failed, 3120 chars\]/.test(analyst),
      keeps: /whether it failed and how many characters came back/.test(command),
      lens: /error, then retry/.test(read('skills/retro/environment.md')),
    },
    { errorThenRetry: true, signal: true, size: true, keeps: true, lens: true },
  )
})

// The anatomy's checklist asked the author to look for these by eye. A pattern a test can see is a
// check, not a rule in prose: the skill's own wrong-home test.
const promptFiles = () =>
  ['skills', 'commands', 'agents'].flatMap((folder) => readdirSync(join(root, folder), { recursive: true }).filter((path) => path.endsWith('.md')).map((path) => join(folder, path)))

function looseEnds(text) {
  const found = []
  let fenced = false
  let open = null
  text.split('\n').forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
    if (fenced) return
    const level = line.match(/^(#{1,6}) /)?.[1].length
    if (/^\s*[-*]\s*$/.test(line)) found.push(`line ${index + 1}: a bullet with nothing in it`)
    if (level && open && open.empty && level <= open.level) found.push(`line ${open.line}: a section with nothing in it`)
    if (level) open = { level, line: index + 1, empty: true }
    else if (line.trim() && open) open.empty = false
  })
  return open?.empty ? [...found, `line ${open.line}: a section with nothing in it`] : found
}

test('a document with an empty section and a stray bullet is caught', () => {
  assert.deepEqual(looseEnds('# Title\n\n## Empty\n\n## Full\n- one\n- \n'), ['line 3: a section with nothing in it', 'line 7: a bullet with nothing in it'])
})

test('no skill, command or agent prompt carries a stray bullet or an empty section', () => {
  assert.deepEqual(promptFiles().flatMap((path) => looseEnds(read(path)).map((found) => `${path} ${found}`)), [])
})
