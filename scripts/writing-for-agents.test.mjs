import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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

test('the skill holds every rule a writer of an agent document applies', () => {
  const skill = read('skills/writing-for-agents/SKILL.md').toLowerCase()
  const rules = ['context load', 'cognitive load', 'pointer', 'one trigger per branch', 'progressive disclosure', 'co-locate', 'completion criterion', 'no-op', 'single source of truth', 'the positive', 'leading word', 'check']

  assert.deepEqual(rules.filter((rule) => !skill.includes(rule)), [])
})

test('the skill anatomy keeps the mechanics of this plugin and points at the skill for the writing', () => {
  const anatomy = read('docs/anatomy/skill-anatomy.md')

  assert.deepEqual(
    {
      points: anatomy.includes('skills/writing-for-agents/SKILL.md'),
      keepsMechanics: ['disable-model-invocation', 'KNOWLEDGE_SKILLS', 'claude plugin eval', 'no-em-dash.test.mjs'].filter((mechanic) => !anatomy.includes(mechanic)),
      restates: ['**Leading words.**', '**Write the positive.**', '**No-ops go.**', '**Progressive disclosure.**'].filter((rule) => anatomy.includes(rule)),
    },
    { points: true, keepsMechanics: [], restates: [] },
  )
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
