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
const SKILL_CALL = /[Cc]all the Skill tool with (?:each of: )?`([a-z0-9-]+)`/g
const AGENT_CALL = /[Cc]all the Agent tool with `([a-z0-9-]+)`/g
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

test('every agent called through the Agent tool exists', () => {
  const unknown = sources.flatMap((path) =>
    [...read(path).matchAll(AGENT_CALL)].map(([, name]) => name).filter((name) => !agentNames.includes(name)).map((name) => `${path}: ${name}`),
  )

  assert.deepEqual(unknown, [])
})

test('skills and agents are reached through their tool, not by a softer phrasing', () => {
  const soft = sources.flatMap((path) => (read(path).match(SOFT_LOAD) ?? []).map((phrase) => `${path}: ${phrase}`))

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
