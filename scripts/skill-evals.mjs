#!/usr/bin/env node
// Plans and reads the description evals under evals/: whether each open skill fires on a prompt that
// should reach it and stays quiet on a near miss, per model. `plan` prints one `claude plugin eval`
// command per model and runs none of them: each run is the owner's, on the owner's credential.
// `summarize` reads what those runs left in evals/results/<model>/aggregate-result.json into one table.
// The commands keep the report local (`--no-publish`) and skip the no-plugin arm (`--ablation none`),
// which can never call one of this plugin's skills and would only double the cost.
// Usage: node skill-evals.mjs plan [--models a,b] | summarize [--dir <dir>]
// No dependencies beyond the Node standard library.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_MODELS = ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5']
const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

export function planEvalRuns({ root, models = DEFAULT_MODELS }) {
  return models.map((model) => `claude plugin eval ${root} --model ${model} --ablation none --no-publish --output-dir ${join(root, 'evals', 'results', model)}`)
}

export function summarizeEvalRuns({ dir }) {
  const scoresByModel = Object.fromEntries(
    readdirSync(dir)
      .filter((model) => existsSync(join(dir, model, 'aggregate-result.json')))
      .sort()
      .map((model) => [model, caseScores(join(dir, model, 'aggregate-result.json'))]),
  )
  const models = Object.keys(scoresByModel)
  if (!models.length) throw new Error(`no aggregate-result.json under ${dir}; run the commands from \`plan\` first`)
  const cases = [...new Set(models.flatMap((model) => Object.keys(scoresByModel[model])))].sort()
  return [
    `| Case | ${models.join(' | ')} |`,
    `|${'---|'.repeat(models.length + 1)}`,
    ...cases.map((name) => `| ${name} | ${models.map((model) => formatScore(scoresByModel[model][name])).join(' | ')} |`),
  ].join('\n')
}

function caseScores(path) {
  const { cases } = JSON.parse(readFileSync(path, 'utf8'))
  return Object.fromEntries(cases.map(({ name, aggregates }) => [name, aggregates.score]))
}

function formatScore(score) {
  return score === undefined ? 'not run' : score.toFixed(2)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [command] = process.argv.slice(2)
  const option = (name) => {
    const at = process.argv.indexOf(name)
    return at === -1 ? undefined : process.argv[at + 1]
  }
  try {
    if (command === 'plan') console.log(planEvalRuns({ root: pluginRoot, models: option('--models')?.split(',') }).join('\n'))
    else if (command === 'summarize') console.log(summarizeEvalRuns({ dir: option('--dir') ?? join(pluginRoot, 'evals', 'results') }))
    else throw new Error('usage: skill-evals.mjs plan [--models a,b] | summarize [--dir <dir>]')
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
