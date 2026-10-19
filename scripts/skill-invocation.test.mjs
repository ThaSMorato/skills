import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// A skill or an agent is reached by naming the tool that reaches it: "Call the Skill tool with `tdd`",
// "Call the Agent tool with `prd-writer`". A softer phrasing ("Use the `tdd` skill") lets the model
// read about the skill or do the agent's work inline, and a name that matches nothing, or an agent
// without the Skill tool, fails only at the moment of use.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKILL_CALL = /[Ll]oad skill `thasmorato-skills:([a-z0-9-]+)`/g
const AGENT_CALL = /[Dd]elegate to subagent `([a-z0-9-]+)`/g
const SOFT_DISPATCH = /\b[Dd]ispatch (?:one |a |an |two )?`[a-z0-9-]+`/g
const SOFT_LOAD = /\b(?:Load|load|Use|use|Run|run|Dispatch|dispatch) (?:\*\*both\*\* |both )?the `[a-z0-9-]+` (?:skill|agent)\b(?!')/g

const skillNames = readdirSync(join(root, 'skills')).filter((name) => existsSync(join(root, 'skills', name, 'SKILL.md')))
const agentNames = readdirSync(join(root, 'agents')).filter(file => file.endsWith('.md')).map((file) => file.replace(/\.md$/, ''))

function markdownFiles(dir) {
  return readdirSync(join(root, dir), { recursive: true })
    .filter((path) => path.endsWith('.md'))
    .map((path) => join(dir, path))
}

const sources = [...markdownFiles('skills'), ...markdownFiles('agents'), ...markdownFiles('commands'), ...markdownFiles('workflows'), ...markdownFiles('agent-specs')]
const read = (path) => readFileSync(join(root, path), 'utf8')

test('every skill called through the Skill tool exists', () => {
  const unknown = sources.flatMap((path) =>
    [...read(path).matchAll(SKILL_CALL)].map(([, name]) => name).filter((name) => !skillNames.includes(name)).map((name) => `${path}: ${name}`),
  )

  assert.deepEqual(unknown, [])
})

// `disable-model-invocation: true` refuses every Skill tool call, a command's included, so a skill
// that something calls through the tool and that carries the flag can never be reached.
test('no skill called through the Skill tool is closed to model invocation', () => {
  const called = new Set(sources.flatMap((path) => [...read(path).matchAll(SKILL_CALL)].map(([, name]) => name)))
  const unreachable = [...called].filter((name) => /^disable-model-invocation: true$/m.test(read(join('skills', name, 'SKILL.md'))))

  assert.deepEqual(unreachable.sort(), [])
})

// A bare name in "Call the Skill tool with `x`" resolves to a Claude Code built-in skill or command
// before a plugin skill, so a skill named like one is never reached: `design` hit a built-in skill that
// refuses model invocation, `plan` hit the built-in /plan command. Add a name here when Claude Code
// ships a built-in under it.
const CLAUDE_CODE_BUILT_INS = [
  'design', 'init', 'loop', 'schedule', 'simplify', 'run', 'code-review', 'security-review',
  'plan', 'review', 'agents', 'clear', 'compact', 'config', 'context', 'cost', 'doctor', 'export',
  'help', 'hooks', 'ide', 'memory', 'model', 'permissions', 'plugin', 'resume', 'rewind', 'skills',
  'status', 'tasks', 'usage',
]

test('no skill is named like a Claude Code built-in skill', () => {
  const shadowed = skillNames.filter((name) => CLAUDE_CODE_BUILT_INS.includes(name))

  assert.deepEqual(shadowed, [])
})

test('every agent called through the Agent tool exists', () => {
  const unknown = sources.flatMap((path) =>
    [...read(path).matchAll(AGENT_CALL)].map(([, name]) => name).filter((name) => !agentNames.includes(name)).map((name) => `${path}: ${name}`),
  )

  assert.deepEqual(unknown, [])
})

test('skills and agents are reached through their tool, not by a softer phrasing', () => {
  const soft = sources.flatMap((path) =>
    [...(read(path).match(SOFT_LOAD) ?? []), ...(read(path).match(SOFT_DISPATCH) ?? [])].map((phrase) => `${path}: ${phrase}`),
  )

  assert.deepEqual(soft, [])
})

test('an agent that calls the Skill tool has it in its tools', () => {
  const missingTool = markdownFiles('agents').filter((path) => {
    const body = read(path)
    const tools = body.match(/^tools:(.*)$/m)?.[1] ?? ''
    return body.match(SKILL_CALL) !== null && !/\bSkill\b/.test(tools)
  })

  assert.deepEqual(missingTool, [])
})
