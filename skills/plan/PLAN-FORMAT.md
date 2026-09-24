> Part of the `plan` skill (see `SKILL.md`). The exact shape of a plan document.

# Plan document format

Location: `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

The work for one ticket leaves four sibling artifacts, and together they are the state the `/flow` scan reads:

| File | Written by | Means |
|---|---|---|
| `.scratch/<feature-slug>/design/<NN>-<slug>.md` | `design` | the node map exists |
| `plans/<NN>-<slug>/plan.md` | `plan` | the work is sliced |
| `plans/<NN>-<slug>/validation.md` | `plan-validate` | the verdict, `clean` or `dirty` |
| `plans/<NN>-<slug>/progress.md` | `implement` | how many SIs are done |

```markdown
---
kind: plan
slug: <NN>-<slug>
ticket: .scratch/<feature-slug>/issues/<NN>-<slug>.md
design: .scratch/<feature-slug>/design/<NN>-<slug>.md
type: behavioral | structural
gear: full | feature | small
sis_planned: <number of SIs below>
revision: <1 when first written; +1 every time the plan is revised after a dirty validation>
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
- **Acceptance criteria:** <observable outcome(s), each naming the ticket AC id it serves, e.g. "(AC-2)">

### SI-2 — <name>
- ...

## Dependency Map
<The order SIs execute in. A simple list when linear; an explicit DAG when SIs fan out.
 e.g. SI-1 → SI-2 → SI-3, with SI-4 blocked by SI-2.>

## AC coverage
| Ticket AC | Owned by |
|---|---|
| AC-1 | SI-1, SI-3 |

## Deliverables
- [ ] Every SI's tests are green
- [ ] <type-check command> passes
- [ ] <lint command> passes (if the repo has one)
- [ ] <build command> passes (if the repo has one)
- [ ] <each ticket acceptance criterion, restated as a checkable line>
```

## The frontmatter is what gets counted
`gear` is copied from the ticket's `Gear` field (absent → `full`). `sis_planned` and `revision` are plain integers, not prose — `/retro` reads them to compare planned against done and to count the rounds a plan took, and a number written as a sentence cannot be summed. Keep the reason for a revision in the body, not in the field.

## Rules for a good plan
- **One SI = one red → green → refactor cycle** that fits a fresh context window. **If an SI needs two Acts to describe, split it** — the single-act rule, at plan scale.
- **Vertical, not horizontal.** Each SI cuts through every layer it needs; never "all schema, then all API".
- **Seams are named up front.** The `implement` loop writes the failing test at the seam the SI declares — no test seam, no test-first.
- **Every AC is owned, by id.** The coverage table is what makes that mechanical rather than a reading exercise.
- **The plan encodes the node map.** Modules, interfaces and seams come from the map; a plan that invents one has diverged from the design contract.
- **Prefactoring SIs lead.** Reshape first, then build on the easy shape.
- **A structural plan changes no behavior.** For `type: structural`: existing tests are not modified and stay green, and no SI has a red step for behavior it does not add.
- **Deliverables carry real commands.** Discover the repo's test / type-check / lint / build commands (`package.json` scripts, Makefile, the guidelines router's commands table) and name them — the final verification runs exactly these.
- **No stale detail.** Prefer intent over hard-coded file paths and code snippets; the exception is a decision-encoding snippet trimmed to the decision.
