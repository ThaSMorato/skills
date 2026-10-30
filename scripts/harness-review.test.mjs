import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Two harnesses review better than one only when the second is asked at the right time, works with the
// same project rules, and cannot edit what it reviews. The review stage offers the other harness, the
// setup makes its session read-only, and the guidelines stage plants the sentinel the retro reads.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')

describe('the review offers a second opinion in the other harness', () => {
  const review = read('commands/tm-review.md')

  test('it reads the author from progress.md and decides with the script, never by eye', () => {
    assert.match(review, /## 8\. Second opinion/)
    assert.match(review, /node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/second-opinion\.mjs" --diff <the diff file> --guidelines docs\/guidelines\.md/)
    assert.match(review, /`harness` of the ticket's `progress\.md`/)
  })

  test('a skipped second opinion is said with its reason, and the command is named, never run', () => {
    assert.match(review, /say it is skipped and why/)
    assert.match(review, /name the command for the owner to run in the other harness/)
  })

  test('the second opinion has its own file, unprimed by the first, and counts what only it found', () => {
    assert.match(review, /`--second-opinion`/)
    assert.match(review, /`\.scratch\/<feature-slug>\/reviews\/<NN>-<slug>\.second-opinion\.md`/)
    assert.match(review, /no lens receives the first review/)
    assert.match(review, /not_in_first: <confirmed findings the first review does not have>/)
    assert.match(review, /opinion: first \| second/)
  })

  test('the flow names the second opinion after the review', () => {
    assert.match(read('commands/tm-flow.md'), /optional second opinion in the other harness/)
  })

  test('the project names its own risk paths in the guidelines router', () => {
    assert.match(read('templates/guidelines.md'), /## \d+\. Risk paths/)
    assert.match(read('agents/guideline-generator.md'), /Risk paths/)
  })

  test('the retro and the flow report measure what the second opinion found per pair', () => {
    assert.match(read('skills/retro/SKILL.md'), /`not_in_first`/)
    assert.match(read('skills/flow-report/SKILL.md'), /`not_in_first`/)
  })
})

describe('the project instructions reach both harnesses, measured', () => {
  test('the guidelines stage plants the sentinel after the pointers', () => {
    assert.match(read('agents/guideline-generator.md'), /node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/instructions-sentinel\.mjs" write --root \./)
    assert.match(read('commands/tm-guidelines.md'), /sentinel/)
  })

  test('the retro and the flow report check the field with the script, per harness', () => {
    for (const path of ['skills/retro/SKILL.md', 'skills/flow-report/SKILL.md']) {
      assert.match(read(path), /instructions-sentinel\.mjs" check/, path)
      assert.match(read(path), /`instructions`/, path)
    }
  })
})

describe('the Codex setup makes the review session read-only', () => {
  test('the setup reports the profile and how to run a review in it', () => {
    const setup = read('adapters/codex/tm-setup.md')

    assert.match(setup, /tm-review\.config\.toml/)
    assert.match(setup, /codex -p tm-review/)
  })

  test('the README says which stages run in the profile and which write to approve', () => {
    const readme = read('README.md')

    assert.match(readme, /codex -p tm-review/)
    assert.match(readme, /approve only the write of its report/)
  })
})
