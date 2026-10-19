#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
export const planDigest = path => createHash('sha256').update(readFileSync(path)).digest('hex')
export function checkValidation(plan, validation) {
  const text = readFileSync(validation, 'utf8')
  const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? ''
  return /^status: clean\s*$/m.test(front) && front.match(/^plan_sha256: ([a-f0-9]{64})\s*$/m)?.[1] === planDigest(plan)
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [plan, validation] = process.argv.slice(2)
    if (!plan) throw new Error('Usage: plan-digest.mjs <plan.md> [validation.md]')
    if (validation) { if (!checkValidation(plan, validation)) throw new Error('Missing, dirty or stale validation') }
    else process.stdout.write(planDigest(plan) + '\n')
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1 }
}
