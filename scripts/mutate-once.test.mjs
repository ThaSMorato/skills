import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { mutateOnce } from './mutate-once.mjs'

// A test that cannot fail proves nothing. The red step shows that each new case fails when the
// behavior it names is broken: break it once, at one place, run the case, and put the code back.

const ORIGINAL = 'export const isOverdue = (days) => days > 30\n'

describe('mutateOnce', () => {
  let dir
  const source = () => join(dir, 'invoice.js')
  const log = () => join(dir, 'mutation.log')
  const failsWhenMutated = ['-e', `process.exit(require('fs').readFileSync(${JSON.stringify(join('DIR', 'invoice.js'))}, 'utf8').includes('days > 30') ? 0 : 1)`]
  const testCommand = () => ({ command: process.execPath, args: failsWhenMutated.map((arg) => arg.replace('DIR', dir)) })

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mutate-once-'))
    writeFileSync(source(), ORIGINAL)
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  test('a case that goes red under the mutation killed it', () => {
    const sut = mutateOnce({ file: source(), from: 'days > 30', to: 'days >= 30', log: log(), ...testCommand() })

    assert.equal(sut.verdict, 'killed')
  })

  test('a case that stays green under the mutation let it survive', () => {
    const sut = mutateOnce({ file: source(), from: 'isOverdue', to: 'isLate', log: log(), ...testCommand() })

    assert.equal(sut.verdict, 'survived')
  })

  test('the file is put back after the run, whatever the verdict', () => {
    mutateOnce({ file: source(), from: 'days > 30', to: 'days >= 30', log: log(), ...testCommand() })

    assert.equal(readFileSync(source(), 'utf8'), ORIGINAL)
  })

  test('the output of the run goes to the log', () => {
    mutateOnce({ file: source(), from: 'days > 30', to: 'days >= 30', log: log(), command: process.execPath, args: ['-e', 'console.log("ran the case")'] })

    assert.match(readFileSync(log(), 'utf8'), /ran the case/)
  })

  test('a text that is not in the file exactly once is refused, and the file is untouched', () => {
    writeFileSync(source(), ORIGINAL + ORIGINAL)

    assert.throws(() => mutateOnce({ file: source(), from: 'days > 30', to: 'days >= 30', log: log(), ...testCommand() }), /exactly once.*found 2/)
    assert.equal(readFileSync(source(), 'utf8'), ORIGINAL + ORIGINAL)
  })

  test('a command that cannot start is an error, not a kill, and the file is put back', () => {
    assert.throws(
      () => mutateOnce({ file: source(), from: 'days > 30', to: 'days >= 30', log: log(), command: join(dir, 'no-such-runner'), args: [] }),
      /could not start/,
    )
    assert.deepEqual({ restored: readFileSync(source(), 'utf8') === ORIGINAL, logged: existsSync(log()) }, { restored: true, logged: true })
  })
})
