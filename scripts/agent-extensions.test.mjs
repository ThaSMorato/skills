import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { readAgentExtensions } from './agent-extensions.mjs'

// The skills, plugins, MCP servers and hooks a repo declares are dependencies too: they run code or
// put text in front of the agent on every teammate's machine. Listing them, and telling a pinned one
// from one that fetches whatever is latest on each start, is mechanical; judging the risk is not.

describe('readAgentExtensions', () => {
  let repo
  const put = (path, text) => {
    mkdirSync(dirname(join(repo, path)), { recursive: true })
    writeFileSync(join(repo, path), text)
  }
  const putJson = (path, value) => put(path, JSON.stringify(value, null, 2))
  const named = (sut, name) => sut.extensions.find((extension) => extension.name === name)

  beforeEach(() => {
    repo = realpathSync(mkdtempSync(join(tmpdir(), 'extensions-')))
  })

  afterEach(() => rmSync(repo, { recursive: true, force: true }))

  test('a repo that declares nothing has no extensions and reads no file', () => {
    assert.deepEqual(readAgentExtensions({ root: repo }), { root: repo, files: [], extensions: [] })
  })

  test('an MCP server run through npx is pinned only by an exact version', () => {
    putJson('.mcp.json', {
      mcpServers: {
        exact: { command: 'npx', args: ['-y', '@acme/mcp-server@1.4.2'] },
        latest: { command: 'npx', args: ['-y', '@acme/other@latest'] },
        bare: { command: 'npx', args: ['some-server'] },
        range: { command: 'npx', args: ['-y', 'ranged@^2.0.0'] },
      },
    })

    const sut = readAgentExtensions({ root: repo })

    assert.deepEqual(
      sut.extensions.map(({ name, pinned }) => [name, pinned]),
      [['exact', true], ['latest', false], ['bare', false], ['range', false]],
    )
  })

  test('a server carries its source package and the command it runs', () => {
    putJson('.mcp.json', { mcpServers: { exact: { command: 'npx', args: ['-y', '@acme/mcp-server@1.4.2'] } } })

    assert.deepEqual(named(readAgentExtensions({ root: repo }), 'exact'), {
      kind: 'mcp-server',
      name: 'exact',
      file: '.mcp.json',
      source: '@acme/mcp-server@1.4.2',
      pinned: true,
      runs: 'npx -y @acme/mcp-server@1.4.2',
      env: [],
    })
  })

  test('uvx and docker are pinned by an exact version, a fixed tag or a digest', () => {
    putJson('.mcp.json', {
      mcpServers: {
        py: { command: 'uvx', args: ['mcp-server-git==0.6.2'] },
        pyLoose: { command: 'uvx', args: ['mcp-server-git'] },
        image: { command: 'docker', args: ['run', '-i', '--rm', '-e', 'TOKEN', 'ghcr.io/acme/server:1.2.0'] },
        imageLatest: { command: 'docker', args: ['run', '-i', 'ghcr.io/acme/server'] },
        digest: { command: 'docker', args: ['run', 'ghcr.io/acme/server@sha256:abc123'] },
      },
    })

    assert.deepEqual(
      readAgentExtensions({ root: repo }).extensions.map(({ name, source, pinned }) => [name, source, pinned]),
      [
        ['py', 'mcp-server-git==0.6.2', true],
        ['pyLoose', 'mcp-server-git', false],
        ['image', 'ghcr.io/acme/server:1.2.0', true],
        ['imageLatest', 'ghcr.io/acme/server', false],
        ['digest', 'ghcr.io/acme/server@sha256:abc123', true],
      ],
    )
  })

  test('a remote server or a script of the repo has no version to pin', () => {
    putJson('.mcp.json', {
      mcpServers: {
        remote: { type: 'http', url: 'https://mcp.example.com/mcp' },
        local: { command: 'node', args: ['./tools/server.js'] },
      },
    })

    assert.deepEqual(
      readAgentExtensions({ root: repo }).extensions.map(({ name, source, pinned, runs }) => [name, source, pinned, runs]),
      [
        ['remote', 'https://mcp.example.com/mcp', null, null],
        ['local', './tools/server.js', null, 'node ./tools/server.js'],
      ],
    )
  })

  test('an env value never leaves the script, only its name', () => {
    const secret = 'sk-live-0123456789abcdef'
    putJson('.mcp.json', { mcpServers: { db: { command: 'npx', args: ['db-mcp@1.0.0'], env: { DB_PASSWORD: secret, DB_HOST: 'localhost' } } } })
    put('.codex/config.toml', `[mcp_servers.gh]\ncommand = "npx"\nargs = ["gh-mcp@2.0.0"]\nenv = { GH_TOKEN = "${secret}" }\n`)

    const sut = readAgentExtensions({ root: repo })

    assert.equal(JSON.stringify(sut).includes(secret), false)
    assert.deepEqual(sut.extensions.map(({ name, env }) => [name, env]), [['db', ['DB_HOST', 'DB_PASSWORD']], ['gh', ['GH_TOKEN']]])
  })

  test('the Codex config declares servers in its own tables, with env as a table too', () => {
    put(
      '.codex/config.toml',
      [
        'model = "gpt-6"',
        '',
        '[mcp_servers.docs]',
        'command = "npx"',
        'args = ["-y", "docs-mcp@latest"]',
        '',
        '[mcp_servers.docs.env]',
        'DOCS_KEY = "value"',
        '',
        '[mcp_servers.remote]',
        'url = "https://mcp.example.com"',
      ].join('\n'),
    )

    assert.deepEqual(
      readAgentExtensions({ root: repo }).extensions.map(({ kind, name, file, pinned, env }) => [kind, name, file, pinned, env]),
      [
        ['mcp-server', 'docs', '.codex/config.toml', false, ['DOCS_KEY']],
        ['mcp-server', 'remote', '.codex/config.toml', null, []],
      ],
    )
  })

  test('a plugin is as pinned as the marketplace it comes from, and a marketplace by a commit', () => {
    putJson('.claude/settings.json', {
      enabledPlugins: { 'helper@acme-tools': true, 'old@acme-tools': false, 'pinned-one@fixed': true },
      extraKnownMarketplaces: {
        'acme-tools': { source: { source: 'github', repo: 'acme/tools', ref: 'main' } },
        fixed: { source: { source: 'git', url: 'https://git.example.com/fixed.git', sha: 'a1b2c3d' } },
      },
    })

    assert.deepEqual(
      readAgentExtensions({ root: repo }).extensions.map(({ kind, name, source, pinned }) => [kind, name, source, pinned]),
      [
        ['marketplace', 'acme-tools', 'github:acme/tools#main', false],
        ['marketplace', 'fixed', 'https://git.example.com/fixed.git@a1b2c3d', true],
        ['plugin', 'helper@acme-tools', 'acme-tools', false],
        ['plugin', 'pinned-one@fixed', 'fixed', true],
      ],
    )
  })

  test('a plugin from a marketplace the repo does not declare has an unknown pin', () => {
    putJson('.claude/settings.json', { enabledPlugins: { 'thing@somewhere': true } })

    assert.equal(named(readAgentExtensions({ root: repo }), 'thing@somewhere').pinned, null)
  })

  test('every hook command is listed under its event, pinned like a server', () => {
    putJson('.claude/settings.json', {
      hooks: {
        PostToolUse: [{ matcher: 'Edit', hooks: [{ type: 'command', command: 'npx prettier --write' }] }],
        Stop: [{ hooks: [{ type: 'command', command: './scripts/check.sh' }] }],
      },
    })

    assert.deepEqual(
      readAgentExtensions({ root: repo }).extensions.map(({ kind, name, pinned, runs }) => [kind, name, pinned, runs]),
      [
        ['hook', 'PostToolUse Edit', false, 'npx prettier --write'],
        ['hook', 'Stop', null, './scripts/check.sh'],
      ],
    )
  })

  test('a skill of the repo lists the scripts it ships, for either harness', () => {
    put('.claude/skills/deploy/SKILL.md', '---\nname: deploy\n---\n')
    put('.claude/skills/deploy/scripts/run.sh', 'echo hi\n')
    put('.agents/skills/review/SKILL.md', '---\nname: review\n---\n')

    assert.deepEqual(
      readAgentExtensions({ root: repo }).extensions.map(({ kind, name, file, scripts }) => [kind, name, file, scripts]),
      [
        ['skill', 'deploy', '.claude/skills/deploy/SKILL.md', ['.claude/skills/deploy/scripts/run.sh']],
        ['skill', 'review', '.agents/skills/review/SKILL.md', []],
      ],
    )
  })

  test('the personal settings file is never read, and every file read is listed', () => {
    putJson('.claude/settings.local.json', { enabledPlugins: { 'private@mine': true } })
    putJson('.mcp.json', { mcpServers: {} })

    const sut = readAgentExtensions({ root: repo })

    assert.deepEqual([sut.files, sut.extensions], [['.mcp.json'], []])
  })

  test('a declaration file that does not parse is an error naming the file', () => {
    put('.mcp.json', '{ not json')

    assert.throws(() => readAgentExtensions({ root: repo }), /\.mcp\.json/)
  })

  test('the parse error of a broken declaration file never quotes its contents', () => {
    const secret = 'hunter2'
    put('.mcp.json', secret)

    assert.throws(() => readAgentExtensions({ root: repo }), (error) => !error.message.includes(secret))
  })
})

describe('the dependency audit covers agent extensions', () => {
  const pluginRoot = join(dirname(new URL(import.meta.url).pathname), '..')
  const auditor = readFileSync(join(pluginRoot, 'agents', 'dependency-auditor.md'), 'utf8')

  test('the auditor runs the extensions script and reports them in their own section', () => {
    assert.match(auditor, /node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/agent-extensions\.mjs" --root \./)
    assert.match(auditor, /`## Agent extensions`/)
  })

  test('the declaration files are read only through the script, which keeps env values out of context', () => {
    assert.match(auditor, /Read none of these files yourself/)
    assert.match(auditor, /every path in the script's `files` goes into `lockfiles`/)
  })

  test('the report keeps env names only, and its stale check covers the extension files', () => {
    assert.match(auditor, /env \*\*names\*\*, never values/)
    assert.match(auditor, /lockfiles: \[<every manifest, lockfile and agent-extension file read/)
  })
})
