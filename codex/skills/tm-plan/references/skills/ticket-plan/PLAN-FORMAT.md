> Part of the `ticket-plan` skill (see `references/skills/ticket-plan/index.md`). The exact shape of a plan document.

# Plan document format

Location: `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

The work for one ticket leaves four sibling artifacts, and together they are the state the `$thasmorato-skills:tm-flow` scan reads:

| File | Written by | Means |
|---|---|---|
| `.scratch/<feature-slug>/design/<NN>-<slug>.md` | `design` | the node map exists |
| `plans/<NN>-<slug>/plan.md` | `plan` | the work is sliced |
| `plans/<NN>-<slug>/validation.md` | `plan-validate` | the verdict, `clean` or `dirty` |
| `plans/<NN>-<slug>/progress.md` | `implement` | how many SIs are done |

```markdown
---
kind: plan
plugin_version: 0.7.0
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
slug: <NN>-<slug>
ticket: .scratch/<feature-slug>/issues/<NN>-<slug>.md
design: .scratch/<feature-slug>/design/<NN>-<slug>.md
type: behavioral | structural | bugfix
gear: full | feature | small
sis_planned: <number of SIs below>
revision: <1 when first written; +1 every time the plan is revised after a dirty validation>
---

# Plan: <NN> <Ticket title>

## Objective
<One or two sentences: the end-to-end behavior this ticket makes work, from the user's perspective.>

## Step Implementations

### SI-1: <name>
- **Description:** <what this vertical slice delivers>
- **Technical actions:** <ordered steps; intent-level, not stale full paths>
- **Tests:** <seam(s) + layer(s) to cover, per the `testing` skill, or `none (<reason>)`; each case says whether it **starts red or green**, decided after grepping the existing assertions it touches, and the behavior that turns it red (what, broken, would make it fail), leaving the exact mutation to the red step>
- **Contracts changed:** <every interface, route, event, message or schema this SI changes, with its consumers (callers, specs, observers); `none` when it changes none>
- **Mirror:** <optional: `path:line` rows from the node map's Conventions to mirror that this SI's code should look like>
- **Dependencies:** <SI ids that must complete first, or `none`>
- **Acceptance criteria:** <observable outcome(s), each naming the ticket AC id it serves, e.g. "(AC-2)">

### SI-2: <name>
- ...

## Dependency Map
<The order SIs execute in. A simple list when linear; an explicit DAG when SIs fan out.
 e.g. SI-1 → SI-2 → SI-3, with SI-4 blocked by SI-2.>

## Verification prerequisites
> What checking the ACs needs that does not exist yet: persisted state, a fixture in the project's own
> path, a config value, a seeded user. Each is produced by an SI, so `$thasmorato-skills:tm-acceptance` finds it; one no SI
> produces is a gap to close here. `none` when the ACs need nothing beyond the code.

| Prerequisite | Produced by | Needed by |
|---|---|---|
| <a seeded admin user> | SI-1 | AC-2 |

## Slicing
> [!NOTE]
> Decided: <the SI count and the merges or splits the owner chose, e.g. "3 SIs; validations merged into SI-2"> — owner, <YYYY-MM-DD>

## AC coverage
| Ticket AC | Owned by |
|---|---|
| AC-1 | SI-1, SI-3 |

## Deliverables
- [ ] Every SI's tests are green
- [ ] <install command with the frozen lockfile> (when a manifest changes)
- [ ] <type-check command> passes
- [ ] <lint command, at the scope the repo's hook or CI runs it> passes (if the repo has one)
- [ ] <build command> passes (if the repo has one)
- [ ] <each ticket acceptance criterion, restated as a checkable line>
- [ ] Docs this diff makes false, fixed: <file → the symbol or statement it cites>, or `none (searched <terms>)`
```

## The frontmatter is what gets counted
`gear` is copied from the ticket's frontmatter `gear` (in a ticket that predates it, the `Gear` Metadata line; absent → `full`). `sis_planned` and `revision` are plain integers, not prose; `$thasmorato-skills:tm-retro` reads them to compare planned against done and to count the rounds a plan took, and a number written as a sentence cannot be summed. Keep the reason for a revision in the body, not in the field.

## Rules for a good plan
- **Coarse by default.** Propose the fewest SIs that clear the floor below and the ceiling in this rule list; merge what touches the same file, function, node or screen, what one check verifies, and what has only one consumer (`references/skills/ticket-plan/index.md` §2). At `gear: small`, 1 to 3 SIs.
- **One SI = one red → green → refactor cycle** that fits a fresh context window. **If an SI needs two Acts to describe, split it**: the single-act rule, at plan scale. Work verified by the same check at the same seam is one Act, however many ACs it closes.
- **Vertical, not horizontal.** Each SI cuts through every layer it needs; never "all schema, then all API".
- **Seams are named up front.** The `implement` loop writes the failing test at the seam the SI declares; no test seam, no test-first.
- **Every AC is owned, by id.** The coverage table is what makes that mechanical rather than a reading exercise.
- **The plan encodes the node map.** Modules, interfaces and seams come from the map; a plan that invents one has diverged from the design contract.
- **Prefactoring SIs lead.** Reshape first, then build on the easy shape. A prefactoring SI names the AC it makes easy (`enables AC-2`) in place of an AC it owns.
- **An SI has a floor.** It changes production code, changes something observable at its seam, and owns at least one AC. "Write the test for X" and "change the value" are steps of an SI, not SIs. If the plan has more SIs than the ticket has ACs, check that each one clears the floor before you present it.
- **A bugfix plan starts from the diagnosis.** For `type: bugfix`: the ticket's Source is a `$thasmorato-skills:tm-diagnose` file with `status: cause-found`. The first SI writes the pinned and flipped tests at **every level** the diagnosis lists (`levels`), and the flipped tests are its red step; the fix is the green. The flipped tests are sealed: no later SI edits them. A level in the diagnosis's `seam_gaps` has no test SI; the plan names it as a known gap instead. The final verification also runs the diagnosis's `loop` command against the original scenario, and it must go green; the commit or PR message names the hypothesis that held.
- **A structural plan changes no behavior.** For `type: structural`: existing tests are not modified and stay green, and no SI has a red step for behavior it does not add.
- **Deliverables name the docs the diff makes false.** The node map's `Documents to amend` is the start. Then grep every identifier the ticket renames or removes, and every member it adds to an enum or a closed list, across `docs/`, `CONTEXT.md`, the READMEs, the sibling FDDs and this feature's own FDD (its contracts and rules). Each hit is a deliverable line; the SI that changes the symbol fixes it.
- **Deliverables carry real commands, at the repo's own scope.** Take them from the node map's `commit and CI gates` row: the pre-commit hook and the CI decide what "passing" means here (lint of the changed lines or of everything, the paths the hook excludes, build beside type-check and lint). Read each script before naming it: a script name that runs something else, or nothing, is not a deliverable. When a manifest changes, install with the frozen lockfile first. The final verification runs exactly these.
- **No slicing leaves a red test between SIs.** When an SI changes a contract (`Contracts changed`), the same SI updates its consumers and their tests, or the SI that does is its dependency and runs next: a suite left red after an SI makes the next SI's red step meaningless.
- **A visual AC is checked in the browser, at its SI's seam.** When an AC is about how something looks (a color, a spacing, a visibility, a layout at a width), the SI's Tests names a computed style check in the browser (`getComputedStyle` of the element the AC names, at the widths and themes it names), not a class name asserted in a unit test.
- **Verification prerequisites are produced, not assumed.** State, fixtures and config an AC check needs come from an SI and are listed in `## Verification prerequisites`.
- **Mark the decisions the sources do not give.** A threshold, a failure behavior or a visibility rule that the ticket, node map and FDD are silent on is written with `> Assumed:` under the SI that depends on it (the `asking` skill §4 and §6). Facts are not assumptions: if the repo can answer it, look it up.
- **No stale detail.** Prefer intent over hard-coded file paths and code snippets; the exception is a decision-encoding snippet trimmed to the decision. A `Mirror:` pointer is not stale detail: it names existing code to imitate, copied from the node map, and carries no snippet.
