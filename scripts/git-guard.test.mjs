import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync, execFileSync } from 'node:child_process'
import { mkdtempSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The guardrails skill installs git-guard.sh as a Claude Code PreToolUse hook on Bash. It reads the
// hook's JSON from stdin; exit 2 blocks the call and its stderr is what the agent reads, exit 0 lets
// it run. These tests drive the script exactly as the hook does.

const script = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'guardrails', 'git-guard.sh')

function runHook(command, env = {}) {
  const input = JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } })
  return spawnSync('bash', [script], { input, encoding: 'utf8', env: { ...process.env, ...env } })
}

const blocked = [
  'git push',
  'git push --force origin main',
  'git -C ../other push origin HEAD',
  'git reset --hard HEAD~1',
  'git clean -fd',
  'git branch -D feature',
  'git checkout -- .',
  'git restore .',
  'git stash drop',
  'npm test && git push',
]

const allowed = [
  'git status',
  'git log --oneline -5',
  'git reset HEAD file.txt',
  'git branch -d merged-feature',
  'git checkout -b new-branch',
  'git restore --staged file.txt',
  'echo "git push is blocked here"',
  'npm run push-notifications',
]

for (const command of blocked) {
  test(`blocks: ${command}`, () => {
    const result = runHook(command)

    assert.equal(result.status, 2)
    assert.match(result.stderr, /blocked by the guardrails hook/)
  })
}

for (const command of allowed) {
  test(`allows: ${command}`, () => {
    assert.equal(runHook(command).status, 0)
  })
}

test('a pattern can be allowed back through GIT_GUARD_ALLOW', () => {
  assert.equal(runHook('git push origin feature', { GIT_GUARD_ALLOW: 'push' }).status, 0)
})

test('without jq, python3 or node it still reads the command, and still skips quoted text', () => {
  const bin = mkdtempSync(join(tmpdir(), 'git-guard-'))
  for (const tool of ['bash', 'cat', 'sed']) {
    symlinkSync(execFileSync('which', [tool], { encoding: 'utf8' }).trim(), join(bin, tool))
  }
  const onlyCoreTools = { PATH: bin }

  assert.equal(runHook('git reset --hard', onlyCoreTools).status, 2)
  assert.equal(runHook('echo "git push"', onlyCoreTools).status, 0)
})
