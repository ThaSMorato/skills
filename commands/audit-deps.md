---
description: Audit the project's dependencies for outdated/deprecated/vulnerable libraries and license risks.
argument-hint: (optional) focus — e.g. security, licensing, or an ecosystem
---

Use the `dependency-auditor` agent to audit the project's dependencies into `docs/analysis/dependencies.md`. Focus: $ARGUMENTS

It is analysis-only — it never upgrades or edits anything, and it verifies each dependency's actual current version. After it returns, show a short summary: outdated, deprecated, vulnerable, and license-risk items, with recommendations.
