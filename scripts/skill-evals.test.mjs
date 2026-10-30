import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readFrontmatter } from './artifact-frontmatter.mjs'
import { KNOWLEDGE_SKILLS } from './skill-kinds.mjs'
import { planEvalRuns, summarizeEvalRuns } from './skill-evals.mjs'

// An open skill is reached only through its description, so whether it fires is a property of the
// description and of the model reading it. The suite under evals/ asks that question per skill twice:
// a prompt that should fire it and a near miss that should not, run isolated by `claude plugin eval`.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const evals = join(root, 'evals')
const PROMPT_KEYS = new Set(['schema_version', 'name', 'description', 'tags', 'plugins', 'runs', 'expected_outcome', 'model', 'max_turns', 'timeout_seconds', 'allowed_tools', 'append_system_prompt', 'env'])
const READ_ONLY_TOOLS = new Set(['Read', 'Glob', 'Grep', 'NotebookRead', 'Skill', 'AskUserQuestion', 'Agent', 'TodoWrite'])
const caseNames = readdirSync(evals, { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name !== 'results').map(({ name }) => name)
const frontmatterOf = (path) => readFrontmatter(readFileSync(join(evals, path), 'utf8'))
const graderOf = (name) => frontmatterOf(join(name, 'graders', 'skill.md'))
const skillCall = (skill) => JSON.stringify({ skill: `thasmorato-skills:${skill}` })

describe('the description eval suite', () => {
  test('every open skill has a case that should fire it and a near miss that should not', () => {
    const expected = KNOWLEDGE_SKILLS.flatMap((skill) => [`${skill}-fires`, `${skill}-near-miss`]).sort()

    assert.deepEqual([...caseNames].sort(), expected)
  })

  test('a fires case passes only on a Skill call to its own skill', () => {
    const wrong = KNOWLEDGE_SKILLS.filter((skill) => {
      const grader = graderOf(`${skill}-fires`)
      const pattern = new RegExp(grader.input_match)
      const other = KNOWLEDGE_SKILLS.find((name) => name !== skill)
      return grader.type !== 'tool_used' || grader.tool !== 'Skill' || !pattern.test(skillCall(skill)) || pattern.test(skillCall(other)) || pattern.test(skillCall(`${skill}-extra`))
    })

    assert.deepEqual(wrong, [])
  })

  test('a near miss fails on any call to its skill, and is scored in both arms', () => {
    const wrong = KNOWLEDGE_SKILLS.filter((skill) => {
      const grader = graderOf(`${skill}-near-miss`)
      return grader.type !== 'tool_used' || grader.tool !== 'Skill' || grader.min !== 0 || grader.max !== 0 || grader.arm !== 'both' || !new RegExp(grader.input_match).test(skillCall(skill))
    })

    assert.deepEqual(wrong, [])
  })

  test('every prompt uses only documented keys and read-only tools, and is not empty', () => {
    const wrong = caseNames.filter((name) => {
      const text = readFileSync(join(evals, name, 'prompt.md'), 'utf8')
      const frontmatter = readFrontmatter(text)
      const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').trim()
      return !Object.keys(frontmatter).every((key) => PROMPT_KEYS.has(key)) || !frontmatter.allowed_tools.every((tool) => READ_ONLY_TOOLS.has(tool)) || body.length < 40
    })

    assert.deepEqual(wrong, [])
  })

  test('no prompt asks for a skill or the plugin, so only the description can fire it', () => {
    const asking = caseNames.filter((name) => /\bskills?\b|thasmorato/i.test(readFileSync(join(evals, name, 'prompt.md'), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')))

    assert.deepEqual(asking, [])
  })

  test('the local results never reach git', () => {
    assert.match(readFileSync(join(root, '.gitignore'), 'utf8'), /^evals\/results\/$/m)
  })
})

describe('planEvalRuns', () => {
  test('prints one command per model, local only, into its own folder, and runs nothing', () => {
    const sut = planEvalRuns({ root: '/plugin', models: ['claude-haiku-5-5', 'claude-sonnet-5-5'] })

    assert.deepEqual(sut, [
      'claude plugin eval /plugin --model claude-haiku-5-5 --ablation none --no-publish --output-dir /plugin/evals/results/claude-haiku-5-5',
      'claude plugin eval /plugin --model claude-sonnet-5-5 --ablation none --no-publish --output-dir /plugin/evals/results/claude-sonnet-5-5',
    ])
  })

  test('with no models given, it plans the three current families', () => {
    assert.deepEqual(
      planEvalRuns({ root: '/plugin' }).map((command) => command.split(' ')[5]),
      ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5'],
    )
  })
})

describe('summarizeEvalRuns', () => {
  let dir
  const putResult = (model, cases) => {
    mkdirSync(join(dir, model), { recursive: true })
    writeFileSync(join(dir, model, 'aggregate-result.json'), JSON.stringify({ schemaVersion: 1, cases: cases.map(([name, score]) => ({ name, aggregates: { score } })) }))
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'evals-'))
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  test('one row per case, one column per model, with the fraction of runs that passed', () => {
    putResult('claude-haiku-5-5', [['testing-fires', 0.6667], ['testing-near-miss', 1]])
    putResult('claude-opus-5-5', [['testing-fires', 1], ['testing-near-miss', 1]])

    assert.equal(
      summarizeEvalRuns({ dir }),
      [
        '| Case | claude-haiku-5-5 | claude-opus-5-5 |',
        '|---|---|---|',
        '| testing-fires | 0.67 | 1.00 |',
        '| testing-near-miss | 1.00 | 1.00 |',
      ].join('\n'),
    )
  })

  test('a case a model did not run reads as not run, never as zero', () => {
    putResult('claude-haiku-5-5', [['testing-fires', 1]])
    putResult('claude-opus-5-5', [['ui-fires', 0]])

    assert.match(summarizeEvalRuns({ dir }), /\| testing-fires \| 1\.00 \| not run \|\n\| ui-fires \| not run \| 0\.00 \|/)
  })

  test('a folder with no results is an error naming the folder', () => {
    assert.throws(() => summarizeEvalRuns({ dir }), new RegExp(dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  })
})

describe('the skill anatomy says how to test a skill without contamination', () => {
  const anatomy = readFileSync(join(root, 'docs', 'anatomy', 'skill-anatomy.md'), 'utf8')
  const section = anatomy.split(/^## /m).find((part) => part.startsWith('Testing a skill')) ?? ''

  test('description triggering is measured by the eval suite, per model', () => {
    assert.match(section, /`node scripts\/skill-evals\.mjs plan`/)
    assert.match(section, /near miss/)
  })

  test('a live test drops the harness context that could make it pass for the wrong reason', () => {
    assert.match(section, /--setting-sources project,local/)
    assert.match(section, /--strict-mcp-config/)
  })

  test('a live test runs where no file already holds the answer', () => {
    assert.match(section, /outside the plugin's source/)
    assert.match(section, /fixture/)
  })

  test('the checklist asks for it', () => {
    assert.match(anatomy, /- \[ \] An open skill has a `-fires` and a `-near-miss` case under `evals\/`/)
  })
})
