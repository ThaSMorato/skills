> Part of the `plan` skill (see `SKILL.md`). The exact shape of a plan document.

# Plan document format

Location: `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md` (sibling files `validation.md` and `progress.md` are written later by `plan-validate` and `implement`).

```markdown
---
kind: plan
slug: <NN>-<slug>
ticket: .scratch/<feature-slug>/issues/<NN>-<slug>.md
---

# Plan — <NN> <Ticket title>

## Objective
<One or two sentences: the end-to-end behavior this ticket makes work, from the user's perspective.>

## Step Implementations

### SI-1 — <name>
- **Description:** <what this vertical slice delivers>
- **Technical actions:** <ordered steps; intent-level, not stale full paths>
- **Tests:** <seam(s) + layer(s) to cover, per the `testing` skill — or `none — <reason>`>
- **Dependencies:** <SI ids that must complete first, or `none`>
- **Acceptance criteria:** <observable outcome(s); each traces to a ticket AC>

### SI-2 — <name>
- ...

## Dependency Map
<The order SIs execute in. A simple list when linear; an explicit DAG when SIs fan out.
 e.g. SI-1 → SI-2 → SI-3, with SI-4 blocked by SI-2.>

## Deliverables
- [ ] Every SI's tests are green
- [ ] <type-check command> passes
- [ ] <lint command> passes (if the repo has one)
- [ ] <build command> passes (if the repo has one)
- [ ] <each ticket acceptance criterion, restated as a checkable line>
```

## Rules for a good plan
- **One SI = one red → green → refactor cycle** that fits a fresh context window. If an SI needs two Acts to describe, split it.
- **Vertical, not horizontal.** Each SI cuts through every layer it needs; never "all schema, then all API".
- **Seams are named up front.** The `implement` loop writes the failing test at the seam the SI declares — no test seam, no test-first.
- **Prefactoring SIs lead.** Reshape first, then build on the easy shape.
- **Deliverables carry real commands.** Discover the repo's test / type-check / lint / build commands (package.json scripts, Makefile, etc.) and name them — the final verification runs exactly these.
- **No stale detail.** Prefer intent over hard-coded file paths and code snippets; the exception is a decision-encoding snippet trimmed to the decision.
