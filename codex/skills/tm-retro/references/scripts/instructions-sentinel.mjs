#!/usr/bin/env node
// The instruction sentinel: a harmless line in the root CLAUDE.md and AGENTS.md that asks every
// artifact a stage writes to list a value only that file gives (`AGENTS.md:3f9a1c2e`). An artifact
// that carries it was written by an agent that had that file loaded and followed it; one that carries
// none ran without the project's instructions. Neither harness reports this on its own, and which of
// the two files wins when both exist is not documented the same way twice.
// `write` adds the line to the files that exist and never creates one: a new CLAUDE.md would hide
// AGENTS.md from Claude Code. A file that already has a sentinel keeps its token.
// `check` reads the `instructions` field of each artifact given and says what it shows.
// Usage: node instructions-sentinel.mjs write [--root <dir>] | check [--root <dir>] <artifact>...
// No dependencies beyond the Node standard library.

import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { readFrontmatter } from './artifact-frontmatter.mjs'

const INSTRUCTION_FILES = ['CLAUDE.md', 'AGENTS.md']
const SENTINEL = /^- Sentinel \(thasmorato-skills\): list `([^`]+)`/m

export function writeSentinels({ root, token }) {
  const result = { written: [], kept: [], missing: [] }
  for (const file of INSTRUCTION_FILES) {
    const path = join(root, file)
    if (!existsSync(path)) result.missing.push(file)
    else if (SENTINEL.test(readFileSync(path, 'utf8'))) result.kept.push(file)
    else {
      writeFileSync(path, `${readFileSync(path, 'utf8').replace(/\n*$/, '\n')}\n${sentinelLine(`${file}:${token}`)}\n`)
      result.written.push(file)
    }
  }
  return result
}

export function readSentinels({ root }) {
  return Object.fromEntries(
    INSTRUCTION_FILES.filter((file) => existsSync(join(root, file)))
      .map((file) => [file, readFileSync(join(root, file), 'utf8').match(SENTINEL)?.[1]])
      .filter(([, value]) => value),
  )
}

export function checkInstructions({ sentinels, values }) {
  if (values === undefined) return { verdict: 'unknown', followed: [], stale: [] }
  const listed = [values].flat().filter(Boolean).map(String)
  const followed = Object.keys(sentinels).filter((file) => listed.includes(sentinels[file]))
  const stale = listed.filter((value) => !Object.values(sentinels).includes(value))
  const verdict = followed.length ? 'followed' : stale.length ? 'stale' : 'none'
  return { verdict, followed, stale }
}

function sentinelLine(value) {
  return `- Sentinel (thasmorato-skills): list \`${value}\` in the \`instructions\` field of the frontmatter of every artifact a thasmorato-skills stage writes. It changes nothing else: it shows which instruction file reached the agent.`
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [command, ...rest] = process.argv.slice(2)
  const at = rest.indexOf('--root')
  const root = at === -1 ? process.cwd() : rest[at + 1]
  const artifacts = rest.filter((_, index) => index !== at && index !== at + 1)
  try {
    if (command === 'write') console.log(JSON.stringify(writeSentinels({ root, token: randomBytes(4).toString('hex') }), null, 2))
    else if (command === 'check') {
      const sentinels = readSentinels({ root })
      const verdicts = artifacts.map((path) => {
        const fields = readFrontmatter(readFileSync(path, 'utf8')) ?? {}
        return { path, harness: fields.harness ?? 'unknown', ...checkInstructions({ sentinels, values: fields.instructions }) }
      })
      console.log(JSON.stringify(verdicts, null, 2))
    } else throw new Error('usage: instructions-sentinel.mjs write [--root <dir>] | check [--root <dir>] <artifact>...')
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
