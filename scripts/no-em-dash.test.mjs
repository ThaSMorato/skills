import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The suite writes without em dashes: a comma, a colon, a semicolon, parentheses or a full stop say
// which relation is meant, where a dash leaves the reader to guess. The one exception is the separator
// of the three markers validators look for (`> Decided: <value> — <who>, <date>`, `> Needs Input:`,
// `> Assumed:`), kept so documents written with the established format stay valid. Only a marker with a
// value before the dash counts; a sentence that merely names a marker ("mark it `> Assumed:`") does not.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const EM_DASH = '\u2014'
const MARKER_SEPARATOR = new RegExp(`(Decided|Needs Input|Assumed): [^\`${EM_DASH}\\n]+${EM_DASH}`, 'g')

function filesUnder(path) {
  if (statSync(join(root, path)).isFile()) return [path]
  return readdirSync(join(root, path), { recursive: true })
    .map((entry) => join(path, entry))
    .filter((entry) => /\.(md|mjs|json|sh)$/.test(entry) && statSync(join(root, entry)).isFile())
}

const files = ['skills', 'agents', 'commands', 'docs', 'templates', 'scripts', 'README.md'].flatMap(filesUnder)

test('no em dash outside the marker separator', () => {
  const found = files.flatMap((path) =>
    readFileSync(join(root, path), 'utf8')
      .split('\n')
      .map((line, index) => ({ line: line.replace(MARKER_SEPARATOR, ''), number: index + 1 }))
      .filter(({ line }) => line.includes(EM_DASH))
      .map(({ number }) => `${path}:${number}`),
  )

  assert.deepEqual(found, [])
})
