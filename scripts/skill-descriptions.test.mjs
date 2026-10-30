import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// These four skills cover problems a model believes it already knows (an N+1, an injection, a
// refactor, where a seam goes), so on a description that only says what they are, it answered alone:
// none of them fired on any model in the evals/ suite. Measured with `claude plugin eval`, two things
// made them fire with the near misses still quiet: the trigger first, in the words of whoever asks,
// and the instruction to load the skill even when the problem looks familiar.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const descriptionOf = (skill) => readFileSync(join(root, 'skills', skill, 'SKILL.md'), 'utf8').match(/^description: (.+)$/m)?.[1] ?? ''

for (const skill of ['architecture', 'clean-code', 'data-access', 'security']) {
  test(`the ${skill} description opens with its trigger and asks to be loaded on a familiar problem`, () => {
    const sut = descriptionOf(skill)

    assert.deepEqual(
      { triggerFirst: /^'Use when someone asks /.test(sut), loadsOnFamiliar: /Load it before answering, even when the problem looks familiar/.test(sut) },
      { triggerFirst: true, loadsOnFamiliar: true },
    )
  })
}
