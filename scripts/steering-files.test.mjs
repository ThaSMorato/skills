import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { readSteering } from './steering-files.mjs'

// The instructions an agent follows in a repo are spread over CLAUDE.md and AGENTS.md at several
// levels, path-scoped rules, stack guides and the guidelines router. Finding them all, and the
// references in them that point at nothing, is mechanical; judging two of them in contradiction is not.

describe('readSteering', () => {
  let repo
  const put = (path, text) => {
    mkdirSync(dirname(join(repo, path)), { recursive: true })
    writeFileSync(join(repo, path), text)
  }
  const kinds = (sut) => sut.files.map(({ path, kind }) => `${kind} ${path}`)

  beforeEach(() => {
    repo = realpathSync(mkdtempSync(join(tmpdir(), 'steering-')))
  })

  afterEach(() => rmSync(repo, { recursive: true, force: true }))

  test('every steering file is found, at every level, and nothing under node_modules', () => {
    put('CLAUDE.md', '# root\n')
    put('apps/web/CLAUDE.md', '# web\n')
    put('apps/web/AGENTS.md', '# web\n')
    put('.claude/rules/react.md', '---\npaths:\n  - "apps/web/**/*.tsx"\n---\nLoad react-guide.\n')
    put('.claude/skills/react-guide/SKILL.md', '---\nname: react-guide\n---\n')
    put('docs/guidelines.md', '# router\n')
    put('node_modules/pkg/CLAUDE.md', '# vendored\n')

    assert.deepEqual(kinds(readSteering({ root: repo })), [
      'rule .claude/rules/react.md',
      'skill .claude/skills/react-guide/SKILL.md',
      'claude-md CLAUDE.md',
      'agents-md apps/web/AGENTS.md',
      'claude-md apps/web/CLAUDE.md',
      'guidelines docs/guidelines.md',
    ])
  })

  test('a rule carries the paths it is scoped to, written as a list or inline', () => {
    put('.claude/rules/react.md', '---\npaths:\n  - "apps/web/**/*.tsx"\n  - "apps/web/**/*.ts"\n---\n')
    put('.claude/rules/go.md', '---\npaths: ["services/**/*.go"]\n---\n')

    assert.deepEqual(
      readSteering({ root: repo }).files.map(({ path, paths }) => ({ path, paths })),
      [
        { path: '.claude/rules/go.md', paths: ['services/**/*.go'] },
        { path: '.claude/rules/react.md', paths: ['apps/web/**/*.tsx', 'apps/web/**/*.ts'] },
      ],
    )
  })

  test('a referenced path that does not exist is stale, with its line', () => {
    put('src/app.ts', '')
    put('CLAUDE.md', '# root\nRead `src/app.ts` first.\nThe API lives in `src/api/server.ts`.\n')

    assert.deepEqual(readSteering({ root: repo }).stale, [{ file: 'CLAUDE.md', line: 3, reference: 'src/api/server.ts' }])
  })

  test('a path is resolved from the repo root and from the file that cites it', () => {
    put('apps/web/src/main.tsx', '')
    put('apps/web/CLAUDE.md', 'Start at `src/main.tsx`.\n')

    assert.deepEqual(readSteering({ root: repo }).stale, [])
  })

  test('placeholders, globs, URLs, commands and flags are not references', () => {
    put('CLAUDE.md', 'Use `<feature>/plans/x.md`, `src/**/*.ts`, `https://example.com/a.md`, `pnpm test:unit`, `--max-warnings`, `${HOME}/x.md`.\n')

    assert.deepEqual(readSteering({ root: repo }).stale, [])
  })

  test('a rule whose paths match no file yet is unmatched, not stale: it may be for files still to come', () => {
    put('.claude/rules/billing.md', '---\npaths: ["src/billing/**/*.ts"]\n---\n')

    assert.deepEqual({ unmatched: readSteering({ root: repo }).unmatched, stale: readSteering({ root: repo }).stale }, { unmatched: [{ file: '.claude/rules/billing.md', paths: ['src/billing/**/*.ts'] }], stale: [] })
  })
})
