#!/usr/bin/env node
// Breaks one behavior at one place, runs the test that should catch it, and puts the code back.
// The red step of /tm-implement uses it to show that each new case can fail: a case that stays green
// with the behavior broken is a case that proves nothing. The text to replace must occur exactly once,
// so the mutation is the one intended; the file is restored whatever happens; the run goes to a log.
// Usage: node mutate-once.mjs --file <path> --from <text> --to <text> --log <path> -- <command> [args...]
// Prints JSON. Exit status: 0 killed (the case went red), 1 survived, 2 the mutation could not run.
// No dependencies beyond the Node standard library.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

export function mutateOnce({ file, from, to, log, command, args = [] }) {
  const original = readFileSync(file, 'utf8')
  const occurrences = original.split(from).length - 1
  if (occurrences !== 1) throw new Error(`${file}: the text to mutate must occur exactly once, found ${occurrences}`)

  writeFileSync(file, original.replace(from, () => to)) // a function, so a `$&` in the mutation stays literal
  try {
    const run = spawnSync(command, args, { encoding: 'utf8' })
    writeFileSync(log, `$ ${[command, ...args].join(' ')}\n${run.stdout ?? ''}${run.stderr ?? ''}${run.error ? `${run.error.message}\n` : ''}`)
    if (run.error) throw new Error(`${command} could not start: ${run.error.message}`)
    return { file, from, to, exit_code: run.status, verdict: run.status === 0 ? 'survived' : 'killed', log }
  } finally {
    writeFileSync(file, original)
  }
}

function parseArgs(argv) {
  const split = argv.indexOf('--')
  if (split === -1) throw new Error('Usage: node mutate-once.mjs --file <path> --from <text> --to <text> --log <path> -- <command> [args...]')
  const option = (name) => {
    const at = argv.indexOf(`--${name}`)
    if (at === -1 || at > split) throw new Error(`Missing --${name}`)
    return argv[at + 1]
  }
  const [command, ...args] = argv.slice(split + 1)
  return { file: option('file'), from: option('from'), to: option('to'), log: option('log'), command, args }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const result = mutateOnce(parseArgs(process.argv.slice(2)))
    console.log(JSON.stringify(result, null, 2))
    process.exit(result.verdict === 'killed' ? 0 : 1)
  } catch (error) {
    console.error(error.message)
    process.exit(2)
  }
}
