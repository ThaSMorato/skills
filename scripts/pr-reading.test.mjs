import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Reviewing a pull request starts with understanding its shape: which files changed, how they connect
// and where to start, and how much attention it deserves. /tm-pr-map gives that for any pull request,
// a colleague's included, without touching it; /tm-pr and /tm-walkthrough carry the same map for the
// flow's own tickets.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')

test('/tm-pr-map reads its stage skill and is registered with the plugin and in the README', () => {
  assert.deepEqual(
    {
      command: read('commands/tm-pr-map.md').includes('${CLAUDE_PLUGIN_ROOT}/skills/pr-map/SKILL.md'),
      registered: JSON.parse(read('.claude-plugin/plugin.json')).skills.includes('./skills/pr-map'),
      readme: read('README.md').includes('`/tm-pr-map`'),
    },
    { command: true, registered: true, readme: true },
  )
})

test('the pr-map stage draws the map with the script and never changes the pull request or the checkout', () => {
  const sut = read('skills/pr-map/SKILL.md')

  assert.deepEqual(
    {
      script: sut.includes('scripts/change-map.mjs'),
      fetchesTheHead: sut.includes('pull/<number>/head'),
      evidenceFromCi: sut.includes('gh pr checks'),
      neverPosts: /Never post, comment, approve or check out/.test(sut),
      output: sut.includes('.scratch/pr-maps/'),
      kind: sut.includes('kind: pr-map'),
    },
    { script: true, fetchesTheHead: true, evidenceFromCi: true, neverPosts: true, output: true, kind: true },
  )
})

test('every map lists each changed file once, the links between them and an order to read them', () => {
  for (const path of ['skills/pr-map/SKILL.md', 'skills/pr/SKILL.md', 'skills/walkthrough/SKILL.md']) {
    const sut = read(path)

    assert.deepEqual(
      { script: sut.includes('scripts/change-map.mjs'), everyFile: /every changed file exactly once/.test(sut), order: /reading order/i.test(sut) },
      { script: true, everyFile: true, order: true },
      path,
    )
  }
})

test('a review map is the one view that shows every file, not only what the question needs', () => {
  assert.match(read('skills/visuals/SKILL.md'), /A reading map is the exception: it shows every changed file/)
})

test('the PR body turns the door and the blast radius into the attention a review needs, and the owner decides', () => {
  const sut = read('skills/pr/SKILL.md')

  assert.deepEqual(
    {
      attention: sut.includes('**Review attention:** <close | normal | light>'),
      oneWayIsClose: /A one-way door is always `close`/.test(sut),
      ownerDecides: /never a reason to skip the owner's review/.test(sut),
      userData: /starts storing what a user writes/.test(sut),
      radius: ['`privacy`', '`security`', '`money`'].every((word) => sut.includes(word)),
      recorded: ['door:', 'blast_radius:', 'review_attention:'].every((field) => sut.includes(field)),
    },
    { attention: true, oneWayIsClose: true, ownerDecides: true, userData: true, radius: true, recorded: true },
  )
})

test('the PR body says why before what, edits an open pull request, and names a defect found while writing it', () => {
  const sut = read('skills/pr/SKILL.md')

  assert.deepEqual(
    {
      why: /one sentence of why/.test(sut),
      edit: sut.includes('gh pr edit'),
      foundWhileWriting: sut.includes('found while writing, not reviewed'),
    },
    { why: true, edit: true, foundWhileWriting: true },
  )
})

test('the retro sets the attention a pull request got beside whether CI went red', () => {
  assert.match(read('skills/retro/SKILL.md'), /`review_attention`/)
})

test('data-access catalogs the foreign key with no referential action', () => {
  assert.deepEqual(
    { rule: read('skills/data-access/rules/foreign-key-action.md').includes('# Foreign key with no action'), row: read('skills/data-access/SKILL.md').includes('`rules/foreign-key-action.md`') },
    { rule: true, row: true },
  )
})
