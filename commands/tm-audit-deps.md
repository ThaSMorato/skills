---
description: Audit the project's dependencies for vulnerable, deprecated, unmaintained or license-risky libraries, using the ecosystem's own audit tools, plus the MCP servers, plugins, hooks and skills the repo declares.
argument-hint: "(optional) focus, e.g. security, licensing, or an ecosystem"
disable-model-invocation: true
---

Call the Agent tool with `dependency-auditor` to audit the project's dependencies into `docs/analysis/dependencies.md`. Focus: $ARGUMENTS

It runs the ecosystem's native `outdated` and `audit` commands as the primary path; those answer authoritatively and offline, and web lookups per package don't scale past a few dozen dependencies. It is analysis-only: read-only commands, never an install or an auto-fix.

After it returns, show the **act now** items first (vulnerable, deprecated, license-incompatible), each with its advisory id, then what is worth planning, then the agent extensions the repo declares (MCP servers, plugins, hooks, skills) with which ones are unpinned. The full inventory stays in the file as an appendix. Also surface anything the audit could not cover: a missing tool, a skipped ecosystem, an unwalked transitive tree.

The report records when and against which commit it ran (`audited_at`, `audited_commit`, `lockfiles`). That is what lets `/tm-flow` offer a re-run once a lockfile changes or 30 days pass. Nothing re-runs it automatically.
