---
name: generate-test-guide
description: Analyze a project's stack and generate a project-specific testing-guide skill — what to test, at which layer, and how, per artifact type, including acceptance-test flows. Use on "generate a test guide / testing skill for <project>". User-invoked.
disable-model-invocation: true
---

Produce a **concrete, project-specific testing skill** at `.claude/skills/testing-guide-<project>/`. The generic principles live in the `testing` skill; this generator specializes them to one codebase's stack, artifacts, and external systems.

**Input:** `$ARGUMENTS` = the project folder (default: current directory). If the directory holds several sub-projects, ask which one.

Run all four phases — none is optional.

## Phase 1 — Analyze
First read the `testing` skill's `fundamentals.md` — it is the baseline you specialize. Then explore the project and collect:
- **Stack:** languages, frameworks, versions (from `package.json`, `go.mod`, `pyproject.toml`, `Gemfile`, etc.).
- **Test runner + config** (jest, vitest, pytest, go test, RSpec, …).
- **Artifact types:** how this ecosystem names/organizes units (suffix like `*.service.ts`, filename like `views.py`, decorator/signature, directory). Group instances by type; note the dominant test layer per type and the exceptions.
- **External systems:** databases, caches, queues, mail, object storage, third-party HTTP — from compose files, env, config.
- **Existing tests + conventions:** naming, colocated vs `tests/`, current coverage. Note any existing testing skill/rules to avoid contradicting them.

## Phase 2 — Research (version-aware)
For each major framework/runner, search the web for current best practices, how to test each artifact type, real-vs-fake strategy for each external system, and common pitfalls. **Filter by the versions detected in Phase 1** — discard advice referencing APIs newer than the project uses. Keep only what goes beyond the generic fundamentals.

## Phase 3 — Ask the user
Present a summary (stack, artifacts by type with counts, external systems, existing conventions) and ask (via one grouped question set):
1. **Layers** to cover (unit / integration / e2e / all).
2. **External-system strategy** — real (Docker) vs fake, per system, with your recommended default (real if it runs locally in seconds with no cost/flakiness, else fake).
3. **Acceptance tests** — are there user-facing flows that deserve acceptance/e2e coverage (business-readable given/when/then)? Which flows, and with what tool?
4. **Team conventions** — naming, structure, policies to honor.
5. **Coverage philosophy** — pragmatic (critical paths + boundaries) vs thorough (high coverage targets).

## Phase 4 — Generate
Write a multi-file skill at `.claude/skills/testing-guide-<project>/` (name derived from the folder, so a monorepo can hold several):

```
testing-guide-<project>/
├── SKILL.md              (~150–200 lines: purpose, testability foundations for THIS stack,
│                          testing criteria, a feature checklist, an artifact quick-ref table,
│                          anti-patterns, references index)
├── artifacts/            (one file per artifact type: what to test, layer assignment with
│                          all combinations, a reusable setup template, when to skip, project examples)
├── flows/                (one file per acceptance flow: given/when/then, tool, definition of done)
└── references/           (external-systems real/fake, mock boundary rules, file conventions, gotchas)
```

Rules for the generated skill:
- **Trigger phrases are project-scoped** (e.g. "test <project>", "implement <project> feature") so they don't collide with the generic `testing` skill. Cover the whole lifecycle — planning, implementing, testing, reviewing — since the guide is most useful *before* code is written.
- **Reference sub-files with backticks** (`` `artifacts/services.md` ``), never markdown links — links risk eager-loading and break lazy disclosure. Sub-files carry no frontmatter and a one-line back-reference to `SKILL.md`.
- **Concrete, not generic.** Every bullet anchors to an artifact type or code pattern in *this* project. The setup templates are reusable, not instance-specific. Layer assignments trace back to `fundamentals.md`.
- **Acceptance flows are first-class** — the `flows/` files capture the user-facing behavior as business-readable scenarios, name the tool, and state the definition of done. This is what the generic guide can't know: which flows this product must never break.
- The generated guide is a **reference only** — no workflow/orchestration sections.

## Constraints
- Only write inside `.claude/skills/testing-guide-<project>/`. Don't create test files. Don't modify other skills or rules.
- If the path has no recognizable project, say so and stop.
