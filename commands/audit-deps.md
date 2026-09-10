---
description: Audit the project's dependencies for vulnerable, deprecated, unmaintained or license-risky libraries — using the ecosystem's own audit tools.
argument-hint: (optional) focus — e.g. security, licensing, or an ecosystem
---

Use the `dependency-auditor` agent to audit the project's dependencies into `docs/analysis/dependencies.md`. Focus: $ARGUMENTS

It runs the ecosystem's native `outdated` and `audit` commands as the primary path — those answer authoritatively and offline, and web lookups per package don't scale past a few dozen dependencies. It is analysis-only: read-only commands, never an install or an auto-fix.

After it returns, show the **act now** items first — vulnerable, deprecated, license-incompatible — each with its advisory id, then what is worth planning. The full inventory stays in the file as an appendix. Also surface anything the audit could not cover: a missing tool, a skipped ecosystem, an unwalked transitive tree.
