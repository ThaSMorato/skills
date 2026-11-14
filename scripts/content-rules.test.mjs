import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The catalogs a review loads are only as good as the cases they name. Each test pins one case that a
// real project hit and the catalog missed, so a later trim cannot drop it without a red test.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')

describe('security rules', () => {
  test('password hashing tells memory-hard from CPU-hard and gives the minimum parameters', () => {
    const sut = read('skills/security/rules/crypto-failures.md')

    assert.match(sut, /bcrypt is only CPU-hard/)
    assert.match(sut, /truncates at 72 bytes/)
    assert.match(sut, /`m=19 MiB, t=2, p=1`/)
    assert.match(sut, /`N=2\^17, r=8, p=1`/)
    assert.match(sut, /cost of 10 or more/)
  })

  test('a sealed session cookie is a token with no revocation story of its own', () => {
    const sut = read('skills/security/rules/session-management.md')

    assert.match(sut, /sealed cookie/)
    assert.match(sut, /Iron Session/)
  })

  test('refresh rotation consumes atomically and survives a concurrent refresh', () => {
    const sut = read('skills/security/rules/session-management.md')

    assert.match(sut, /`race-conditions`/)
    assert.match(sut, /revoke the whole family/)
    assert.match(sut, /grace window/)
    assert.match(sut, /single-flight/)
  })

  test('a one-time link in a GET is consumed by the mail scanner', () => {
    const sut = read('skills/security/rules/sensitive-data-exposure.md')

    assert.match(sut, /link scanner/)
    assert.match(sut, /`#token=`/)
  })

  test('a secret typed in a terminal lives on in the shell history', () => {
    assert.match(read('skills/security/rules/hardcoded-secrets.md'), /shell history/)
  })

  test('a login that returns early for an unknown user leaks which accounts exist', () => {
    assert.match(read('skills/security/rules/authentication.md'), /dummy hash/)
  })

  test('a public build-time variable named like a secret ships to every visitor', () => {
    const sut = read('skills/security/rules/sensitive-data-exposure.md')

    assert.match(sut, /`NEXT_PUBLIC_`/)
    assert.match(sut, /`server-only`/)
  })

  test('a 403 confirms the resource exists; a sensitive area answers 404', () => {
    const sut = read('skills/security/rules/broken-access-control.md')

    assert.match(sut, /## Existence disclosure: 404 or 403/)
    assert.match(sut, /Masking is not authorizing/)
  })
})

describe('review lenses', () => {
  test('the docs lens checks a generated OpenAPI spec for empty schemas and missing statuses', () => {
    const sut = read('agents/review-docs.md')

    assert.match(sut, /schema a route references has `properties`/)
    assert.match(sut, /every status the handler returns/)
  })

  test('the architecture lens checks that a new module holds its own authority', () => {
    assert.match(read('agents/review-architecture.md'), /`rules\/apparent-modularization\.md`/)
  })
})

describe('code smells and data access', () => {
  test('a business rule in a guard, interceptor or middleware is a smell, and the web detail points at it', () => {
    assert.ok(existsSync(join(root, 'skills/code-smells/rules/business-rule-at-the-edge.md')))
    assert.match(read('skills/architecture/rules/detail-web.md'), /business-rule-at-the-edge\.md/)
  })

  test('apparent modularization is a smell with the deletion test', () => {
    assert.match(read('skills/code-smells/rules/apparent-modularization.md'), /deletion test/i)
  })

  test('a swallowed error is judged by the boundary of the unit of work', () => {
    const sut = read('skills/code-smells/rules/swallowed-error.md')

    assert.match(sut, /## Where the boundary is/)
    assert.match(sut, /dead-letter/)
  })

  test('a compensation inside one database is a finding', () => {
    assert.ok(existsSync(join(root, 'skills/data-access/rules/same-database-compensation.md')))
  })
})

describe('stack guides, tests and diagrams', () => {
  test('a stack guide mines runtime assets, where the environment is read, and migration conventions', () => {
    const sut = read('skills/generate-stack-guide/SKILL.md')

    assert.match(sut, /\*\*Runtime assets:\*\*/)
    assert.match(sut, /\*\*Configuration:\*\*/)
    assert.match(sut, /\*\*Migrations:\*\*/)
  })

  test('Playwright names when the app starts outside webServer, and what page.route cannot see', () => {
    const sut = read('skills/testing/playwright.md')

    assert.match(sut, /outside `webServer`/)
    assert.match(sut, /server-side call/)
  })

  test('MSW has an E2E mode inside the app runtime', () => {
    assert.match(read('skills/testing/frontend-patterns.md'), /`instrumentation\.ts`/)
  })

  test('a Mermaid label with a syntax character is quoted', () => {
    assert.match(read('agents/mermaid-generator.md'), /Quote a label/)
    assert.match(read('skills/visuals/html-report.md'), /Quote a label/)
  })
})
