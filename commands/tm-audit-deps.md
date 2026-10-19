---
description: Audit the project's dependencies for vulnerable, deprecated, unmaintained or license-risky libraries, using the ecosystem's own audit tools.
argument-hint: "(optional) focus, e.g. security, licensing, or an ecosystem"
---

Delegate to subagent `dependency-auditor` to audit the project's dependencies into `docs/analysis/dependencies.md`. Focus: $ARGUMENTS

It runs the ecosystem's native `outdated` and `audit` commands as the primary path; those answer authoritatively and offline, and web lookups per package don't scale past a few dozen dependencies. It is analysis-only: read-only commands, never an install or an auto-fix.

After it returns, show the **act now** items first (vulnerable, deprecated, license-incompatible), each with its advisory id, then what is worth planning. The full inventory stays in the file as an appendix. Also surface anything the audit could not cover: a missing tool, a skipped ecosystem, an unwalked transitive tree.

The report records when and against which commit it ran (`audited_at`, `audited_commit`, `lockfiles`). That is what lets `/tm-flow` offer a re-run once a lockfile changes or 30 days pass. Nothing re-runs it automatically.

## Tooling supply chain
Include third-party skills, plugins and MCP servers in the inventory: source, pinned version/revision, update policy, permissions, execution/network access and provenance. Inspect configuration read-only; do not invoke untrusted tools to audit them. Separate unavailable evidence from confirmed advisories and never invent a vulnerability.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
