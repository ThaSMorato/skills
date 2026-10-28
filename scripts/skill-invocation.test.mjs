import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { KNOWLEDGE_SKILLS, STAGE_ROOT_NOTE } from './skill-kinds.mjs'

// A skill or an agent is reached by naming the tool that reaches it: "Call the Skill tool with `tdd`",
// "Call the Agent tool with `prd-writer`". A softer phrasing ("Use the `tdd` skill") lets the model
// read about the skill or do the agent's work inline, and a name that matches nothing, or an agent
// without the Skill tool, fails only at the moment of use.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKILL_CALL = /[Cc]all the Skill tool with (?:each of: )?`(?:thasmorato-skills:)?([a-z0-9-]+)`/g
const AGENT_CALL = /[Cc]all the Agent tool with `([a-z0-9-]+)`/g
const SOFT_DISPATCH = /\b[Dd]ispatch (?:one |a |an |two )?`[a-z0-9-]+`/g
const SOFT_LOAD = /\b(?:Load|load|Use|use|Run|run|Dispatch|dispatch) (?:\*\*both\*\* |both )?the `[a-z0-9-]+` (?:skill|agent)\b(?!')/g

const skillNames = readdirSync(join(root, 'skills')).filter((name) => existsSync(join(root, 'skills', name, 'SKILL.md')))
const agentNames = readdirSync(join(root, 'agents')).map((file) => file.replace(/\.md$/, ''))

function markdownFiles(dir) {
  return readdirSync(join(root, dir), { recursive: true })
    .filter((path) => path.endsWith('.md'))
    .map((path) => join(dir, path))
}

const sources = [...markdownFiles('skills'), ...markdownFiles('agents'), ...markdownFiles('commands')]
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

// A short name in a Skill tool call resolves to whatever answers to it first: a Claude Code built-in, or
// another plugin's skill (mattpocock's `implement` took ours). The full name reaches this plugin's skill.
test('every Skill tool call names the skill with the plugin prefix', () => {
  const short = sources.flatMap((path) =>
    read(path)
      .split('\n')
      .filter((line) => /Skill tool with/.test(line))
      .flatMap((line) => [...line.matchAll(/`([a-z0-9-]+)`/g)].map(([, name]) => name))
      .filter((name) => skillNames.includes(name))
      .map((name) => `${path}: ${name}`),
  )

  assert.deepEqual(short, [])
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

// The stop rule. A stage ends at its postflight and names the next stage for the owner; it never runs
// one. Text alone did not hold: an agent ran /plan and /plan-validate in a loop until the plan passed.
// So every command and every stage skill carries `disable-model-invocation: true`, which Claude Code
// enforces on the Skill tool, and a command reaches its closed skill by reading it:
// "Read `${CLAUDE_PLUGIN_ROOT}/skills/<name>/SKILL.md` and follow it".
const STAGE_READ = /Read `\$\{CLAUDE_PLUGIN_ROOT\}\/skills\/([a-z0-9-]+)\/SKILL\.md` and follow it/g
const frontmatterOf = (path) => read(path).match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? ''
const isClosed = (path) => /^disable-model-invocation: true$/m.test(frontmatterOf(path))
const commandFiles = readdirSync(join(root, 'commands')).map((file) => join('commands', file))

test('every command is closed to model invocation', () => {
  assert.deepEqual(commandFiles.filter((path) => !isClosed(path)), [])
})

test('every skill but the reference skills is closed to model invocation', () => {
  const misclassified = skillNames.filter((name) => isClosed(join('skills', name, 'SKILL.md')) === KNOWLEDGE_SKILLS.includes(name))

  assert.deepEqual(misclassified, [])
})

test('every closed skill is read by path somewhere, so a command still reaches it', () => {
  const readByPath = new Set(sources.flatMap((path) => [...read(path).matchAll(STAGE_READ)].map(([, name]) => name)))
  const unreachable = skillNames.filter((name) => !KNOWLEDGE_SKILLS.includes(name) && !readByPath.has(name))

  assert.deepEqual(unreachable, [])
})

test('every closed skill tells its reader where its plugin paths start', () => {
  const unanchored = skillNames
    .filter((name) => !KNOWLEDGE_SKILLS.includes(name))
    .filter((name) => !read(join('skills', name, 'SKILL.md')).includes(`---\n\n${STAGE_ROOT_NOTE}\n`))

  assert.deepEqual(unanchored, [])
})

test('a skill read by path exists', () => {
  const unknown = sources.flatMap((path) =>
    [...read(path).matchAll(STAGE_READ)].map(([, name]) => name).filter((name) => !skillNames.includes(name)).map((name) => `${path}: ${name}`),
  )

  assert.deepEqual(unknown, [])
})

test('a stage names the next stage for the owner and never runs one itself', () => {
  const RUNS_A_STAGE = /\b(?:[Rr]e-?run|[Rr]un|[Ii]nvoke|hand off to)\s+`?\/[a-z][a-z-]*/
  const FOR_THE_OWNER = /\btell (?:the )?(?:user|owner|them)\b|\bask (?:the )?(?:user|owner)\b|\b(?:offer|propose|say so)\b|the owner (?:runs|types)/i
  const QUOTED = /\*"[^"]*"\*|"[^"\n]*"/g
  const offending = sources.flatMap((path) =>
    read(path)
      .replace(QUOTED, '')
      .split(/(?<=[.!?:])\s+|\n/)
      .filter((sentence) => RUNS_A_STAGE.test(sentence) && !FOR_THE_OWNER.test(sentence))
      .map((sentence) => `${path}: ${sentence.trim().slice(0, 100)}`),
  )

  assert.deepEqual(offending, [])
})

// "Call the Skill tool with `a`, then with `b`" names the tool once for both. Rewording the first call
// (a stage skill became a read) leaves "then with `b`" pointing at no tool at all.
test('a chained "then with `x`" still follows a tool call in its sentence', () => {
  const dangling = sources.flatMap((path) =>
    read(path)
      .split(/(?<=\.)\s+|\n/)
      .filter((sentence) => /(?:then|and) with `[a-z0-9-]+`/.test(sentence) && !/(?:Skill|Agent) tool with `/.test(sentence))
      .map((sentence) => `${path}: ${sentence.trim().slice(0, 100)}`),
  )

  assert.deepEqual(dangling, [])
})
