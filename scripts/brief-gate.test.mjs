import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The interview's gate is countable: every (required) section of the brief template filled. /interview
// names those sections so the agent knows what it is counting; a section added to the template and not
// to the command is one the gate silently stops asking for.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')

function requiredSectionsOfTemplate() {
  return [...read('templates/requirements-brief.md').matchAll(/^## (.+?) \(required/gm)]
    .map(([, name]) => name.replace(/ \/.*$/, ''))
    .filter((name) => name !== 'Metadata')
}

function sectionsNamedByTheGate() {
  const [, list] = read('commands/interview.md').match(/sections `\(required\)`: ([^.]+)\./)
  return list.split(', ')
}

test('/interview names every (required) section of the brief template', () => {
  assert.deepEqual(sectionsNamedByTheGate(), requiredSectionsOfTemplate())
})

test('the brief requires guiding scenarios and an antithesis', () => {
  assert.ok(requiredSectionsOfTemplate().includes('Guiding scenarios'))
  assert.ok(requiredSectionsOfTemplate().includes('Antithesis'))
})
