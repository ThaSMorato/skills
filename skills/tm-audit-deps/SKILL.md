---
name: tm-audit-deps
description: Audit the project's dependencies for vulnerable, deprecated, unmaintained or license-risky libraries, using the ecosystem's own audit tools.
argument-hint: "(optional) focus, e.g. security, licensing, or an ecosystem"
user-invocable: false
---

Delegate to subagent `dependency-auditor` to audit the project's dependencies into `docs/analysis/dependencies.md`. Focus: the owner's supplied arguments

It runs the ecosystem's native `outdated` and `audit` commands as the primary path; those answer authoritatively and offline, and web lookups per package don't scale past a few dozen dependencies. It is analysis-only: read-only commands, never an install or an auto-fix.

After it returns, show the **act now** items first (vulnerable, deprecated, license-incompatible), each with its advisory id, then what is worth planning. The full inventory stays in the file as an appendix. Also surface anything the audit could not cover: a missing tool, a skipped ecosystem, an unwalked transitive tree.

The report records when and against which commit it ran (`audited_at`, `audited_commit`, `lockfiles`). That is what lets `/tm-flow` offer a re-run once a lockfile changes or 30 days pass. Nothing re-runs it automatically.

## Tooling supply chain
Include third-party skills, plugins and MCP servers in the inventory: source, pinned version/revision, update policy, permissions, execution/network access and provenance. Inspect configuration read-only; do not invoke untrusted tools to audit them. Separate unavailable evidence from confirmed advisories and never invent a vulnerability.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
