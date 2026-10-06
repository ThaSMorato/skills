import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// /retro and /flow-report compare the flow across plugin versions, so every artifact they measure
// records which version produced it. A producer that drops the field makes its numbers unattributable.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const producers = {
  'node-map': 'skills/design/SKILL.md',
  plan: 'skills/plan/PLAN-FORMAT.md',
  progress: 'skills/implement/SKILL.md',
  validation: 'skills/plan-validate/SKILL.md',
  'tickets-validation': 'skills/tickets-validate/SKILL.md',
  'doc-validation': 'skills/doc-validate/SKILL.md',
  review: 'commands/review.md',
  trim: 'skills/trim/SKILL.md',
  tidy: 'skills/tidy/SKILL.md',
  diagnosis: 'skills/diagnose/SKILL.md',
  walkthrough: 'skills/walkthrough/SKILL.md',
  'meta-retro': 'templates/meta-retro.md',
}

for (const [kind, path] of Object.entries(producers)) {
  test(`${kind} (${path}) records plugin_version next to its kind`, () => {
    const text = readFileSync(join(root, path), 'utf8')

    assert.match(text, new RegExp(`kind: ${kind}\\nplugin_version: `))
  })
}
