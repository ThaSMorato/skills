---
name: guardrails
description: 'Install the barriers that make a repository catch mistakes on its own: a pre-commit hook and a CI job that run the checks the repo already has, a Claude Code hook that stops destructive git commands, and optionally a dependency linter that enforces docs/boundaries.md. Use when /retro reports a missing guardrail, on a new repository, or on "set up pre-commit / CI checks / block git push / guardrails".'
disable-model-invocation: true
---

A mistake a check can catch should never reach a review. This stage installs the checks the repository is missing, using the commands it **already** has: it wires them in, it does not invent a toolchain. Every step is shown to the owner before it is written, because hooks and CI change how everyone on the repository works.

## 1. Inventory
Read, never assume:
- **The check commands**: `package.json` scripts, `Makefile`, `pyproject.toml` / `tox.ini`, `go.mod` (with `go vet`, `go test`), `Gemfile` / `Rakefile`, `docs/guidelines.md`'s commands table. Name each one as **format**, **lint**, **type check**, **test**, or **build**.
- **The hook manager** already present: `.husky/`, `.pre-commit-config.yaml`, `lefthook.yml`, `.git/hooks/` scripts, `simple-git-hooks` in `package.json`.
- **The CI**: `.github/workflows/*.yml`, `.gitlab-ci.yml`, or another, and which of the check commands each job runs.
- **Claude Code hooks** in `.claude/settings.json` and `.claude/settings.local.json`.
- **`docs/boundaries.md`**, if `/boundaries` wrote one.

Run each check command once and record whether it passes today: a hook that wires in a failing command blocks every commit from the first one.

**Done when** there is a table of the five kinds, each with its command (or `none`), whether it passes now, and where it already runs (hook, CI, both, neither). Show it.

## 2. Propose, then ask
From the table, propose only what is missing, as a structured choice the owner picks from:
- **Pre-commit hook**: format and lint on the **staged files only**, plus the type check. Tests go in the hook only when they run in seconds; otherwise they belong to CI. Use the hook manager the repo already has; when it has none, propose the one its ecosystem uses (`husky` + `lint-staged` for Node, the `pre-commit` framework for Python, `lefthook` as the language-neutral choice) and say why.
- **CI job**: lint, type check and tests on every pull request, on the CI platform the repo already uses, with the same commands the table names.
- **Git guard for Claude Code**: `git-guard.sh` as a `PreToolUse` hook on `Bash`, blocking `push`, `reset --hard`, `clean -f`, `branch -D`, `checkout --`, `restore <path>` and `stash drop`/`clear`. The owner picks which rules stay (they are named at the top of the script) and whether it goes in the project (`.claude/settings.json`, shared with the team) or only on this machine (`.claude/settings.local.json`).
- **Dependency linter** (only when `docs/boundaries.md` exists): the rules of `boundaries.md` as forbidden imports, with the tool the stack uses (`dependency-cruiser` for TypeScript and JavaScript, `import-linter` for Python, `depguard` in `golangci-lint` for Go, `packwerk` for Ruby). Propose the config; each rule cites the boundary it enforces.

A check command that fails today is proposed with a choice: fix it first, or wire it in non-blocking (a CI job that reports without failing) until it is fixed. Never wire a failing command in as blocking.

**Done when** the owner has picked, item by item.

## 3. Install
For each item picked, write the files and nothing else:
- **Hook and CI**: the hook manager's config and the CI job, calling the commands from the table as written, with no new scripts in between when a direct call works. Add the dev dependency the hook manager needs, with the repo's package manager.
- **Git guard**: copy `git-guard.sh` to `.claude/hooks/git-guard.sh`, make it executable, edit `RULES` to the rules the owner kept, and add to the chosen settings file:

  ```json
  {
    "hooks": {
      "PreToolUse": [
        { "matcher": "Bash", "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/git-guard.sh" }] }
      ]
    }
  }
  ```

  Merge into the existing `hooks` object when there is one; never replace the file.
- **Dependency linter**: its config, and a script or CI step that runs it.

## 4. Prove each one fires
A guardrail that never fired is not known to work. For each item installed:
- **Pre-commit hook**: stage a file with a deliberate lint error in a scratch commit, show the hook rejecting it, then discard the scratch change.
- **CI job**: validate the file (`actionlint` for GitHub Actions when available, the platform's CI lint otherwise) and say that the first real run is on the next pull request.
- **Git guard**: pipe a sample hook input to it and show exit `2` for a blocked command and `0` for an allowed one:
  `echo '{"tool_input":{"command":"git push"}}' | .claude/hooks/git-guard.sh; echo $?`
  The hook loads in new sessions; tell the owner to restart Claude Code.
- **Dependency linter**: run it and show it passing; then show one forbidden import it would reject (in a scratch file, discarded after).

**Done when** every installed item has shown both outcomes: what it lets through and what it stops.

## Output
Write `docs/guardrails.md`: the inventory table, what was installed and where, the git guard's rules and scope, the commands left non-blocking and why, and how each was proven. `/retro`'s environment lens reads it to tell an absent guardrail from one that is installed but never fired.
