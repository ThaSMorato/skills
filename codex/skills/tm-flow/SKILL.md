---
name: tm-flow
description: "Drive the Doc-Dev flow; scan where the project stands, report what's waiting, and name the next stage for you to run."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): (none): whole project · or <feature/ticket/goal> to scope to one thing


You are the **coordinator**. Scope: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Always scan first, before running anything
The first thing this command does, every time, is **read the disk and say where the project stands**. Not "start at stage one": scan, report, then propose. This is the most common way the command is used ("where am I, what's next, what's waiting on me") and running a stage before answering that is how work gets redone.

State derives from **artifacts on disk**, never from a status file this command maintains. Every artifact is a by-product of whoever did the work, so nothing owes an update to a document that isn't theirs, and any subcommand can run standalone without knowing this command exists. A state file would have to be written by stages that don't own it, and a state file that lies is worse than none.

### Phase 1 (linear): does it exist, and is it approved?
Presence proves **produced**; the artifact's own `Status:` frontmatter proves **approved**. Read both.

| Artifact | Stage | Command |
|---|---|---|
| `docs/analysis/system-profile.md`, `docs/analysis/architecture.md` | brownfield analysis | `$thasmorato-skills:tm-analyze` |
| `docs/analysis/dependencies.md` | dependency audit | `$thasmorato-skills:tm-audit-deps` |
| `docs/analysis/dependency-graph.md`, `docs/analysis/reconcile.md` | the measured import graph, and the drift since the documents | `$thasmorato-skills:tm-analyze` first, `$thasmorato-skills:tm-reconcile` after |
| `.scratch/<effort>/brief.md` + `CONTEXT.md` | interview | `$thasmorato-skills:tm-interview` |
| `docs/research/*.md` | research (optional) | `$thasmorato-skills:tm-research` |
| `docs/product/prd.md` | PRD | `$thasmorato-skills:tm-prd` |
| `docs/architecture/hld.md` | HLD | `$thasmorato-skills:tm-hld` |
| `docs/architecture/components.md` | component map | `$thasmorato-skills:tm-components` |
| `docs/features/README.md` | the feature index: what the system has, and where each feature's living docs are | `$thasmorato-skills:tm-decompose` |
| `.scratch/<effort>/decomposition.md` | this effort's cut: epics, order, dependencies | `$thasmorato-skills:tm-decompose` |
| `docs/evolutions.md` | findings kept but traced to no requirement; read it when scope is next revisited | `$thasmorato-skills:tm-decompose`, `$thasmorato-skills:tm-retro` append |
| `docs/retro/*.md` | what finished work taught about the process | `$thasmorato-skills:tm-retro` |
| `docs/meta-retro/*.md` | what a working session taught: where the owner corrected, rejected or repeated | `$thasmorato-skills:tm-session-analyze` |
| `docs/features/<feature>/fdd.md` | FDD, per feature | `$thasmorato-skills:tm-fdd <feature>` |
| `docs/architecture/boundaries.md` | boundary contract | `$thasmorato-skills:tm-boundaries` |
| `docs/adr/*.md`, `docs/adr/potential/*.md` | ADRs (pending ones are `state: proposed`) | `$thasmorato-skills:tm-adr-identify` → `$thasmorato-skills:tm-adr-generate` |
| `docs/guidelines.md`, `.claude/skills/*-guide/` | guidelines router + stack guides | `$thasmorato-skills:tm-guidelines`, `$thasmorato-skills:tm-generate-stack-guide` |
| `docs/guardrails.md` | the repo's installed checks (pre-commit, CI, git guard, dependency linter) and how each was proven | `$thasmorato-skills:tm-guardrails` |
| `docs/declined.md` | proposals the owner turned down for a lasting reason, read before `$thasmorato-skills:tm-tidy`, `$thasmorato-skills:tm-trim` and `$thasmorato-skills:tm-review` propose again | `$thasmorato-skills:tm-tidy`, `$thasmorato-skills:tm-trim`, `$thasmorato-skills:tm-review` (append-only) |
| `.scratch/<feature>/prototypes/*.md` | design questions answered with throwaway code: the question, the answer, the decision-bearing snippet | `$thasmorato-skills:tm-prototype` |
| `docs/questionnaires/*.md` | questions sent to someone outside the conversation, and their answers (`status: sent / answered / partial`) | `$thasmorato-skills:tm-questionnaire` |
| `docs/validation/*.md` | doc validation verdicts | `$thasmorato-skills:tm-doc-validate` |
| `.scratch/<feature>/issues/` | tickets | `$thasmorato-skills:tm-tickets <feature>` |
| `.scratch/<feature>/tickets-validation.md` | the ticket set's verdict, `clean` or `dirty` | `$thasmorato-skills:tm-tickets-validate <feature>` (the owner runs it after `$thasmorato-skills:tm-tickets`) |

**The old layout.** When the project still has a document at a path `$thasmorato-skills:tm-docs-migrate` lists (a PRD or HLD at the root of `docs/`, an FDD folder, a single features file), it predates the living docs: say so, and name `$thasmorato-skills:tm-docs-migrate` for the owner to run before any stage that writes a document.

**A missing artifact is not automatically a gap.** Before reporting one as missing, check whether a ticket's `Source` records it as a deliberate skip: small work legitimately has no FDD. Report a skip as a skip; offering to generate a document the user consciously declined is how a coordinator teaches people to stop reading it.

### Phase 2: a matrix, not a stage
Phase 2 is a **loop per ticket**, so "the next step" is *which ticket, and which sub-stage it stopped at*. Build this table from the sibling artifacts:

| ticket | design | plan | validate | implement | review |
|---|---|---|---|---|---|
| `01-auth` | ✅ | ✅ | ✅ clean | 3/5 SIs | - |
| `02-profile` | ✅ | ✅ | ⚠️ dirty | - | - |
| `03-billing` | - | - | - | - | - |

- **design**: `.scratch/<feature>/design/<NN>-<slug>.md` exists
- **plan**: `plans/<NN>-<slug>/tm-plan.md` exists
- **validate**: `validation.md`'s `status:` frontmatter
- **implement**: `progress.md`'s `sis_done`/`sis_total` frontmatter (a `progress.md` without frontmatter predates it; read the count from the body and say so)
- **review**: `.scratch/<feature>/reviews/<NN>-<slug>.md` exists; its `verdicts` say how many findings the verifier confirmed

The **frontier** is the tickets whose blockers are all `done`, crossed with where each stopped.

### Then report
Before reporting a ticket done, its request-trace parts all have a ticket or an owner decision, and its acceptance record's `verified_at` is current (no production change since); say which is missing otherwise.

Announce, in this order: **where the project stands**, **what is waiting for your approval** (artifacts whose `Status` is `draft` or `in review`, and any `dirty` validation), and **the next stage**, as the command for the user to type, and stop. The command is the last line, written out with its arguments and "you run it"; it is never one of the options of a question, because an answer to a question is not the owner starting a stage. When the owner's last turn is a command typed as plain text that did not load, say in one line to send it again with the `/` first.

**This command never runs a stage.** Every command and every stage skill is closed to model invocation, so only the owner starts a stage, and each stage ends at its own postflight. A coordinator that ran the next stage itself is how a plan got validated in a loop until it passed, with nobody reading it in between.

## Then size the work, and pick the shortest path that fits
**Before proposing any stage, decide how big this is.** The full chain exists for work whose shape is genuinely unknown. Run it on a two-hour change and it does not merely cost more; it *manufactures* scope, because every template below is a completeness contract, and a completeness contract applied to a small task gets filled with invented content. The machine that makes omission detectable is the same machine that produces bulk.

| Gear | When | Path |
|---|---|---|
| **Full** | a new product, or an epic whose structure is unknown | everything, phase 1 → phase 2 |
| **Feature** | a feature inside a product that already has a PRD, HLD and component map | `$thasmorato-skills:tm-fdd` → `$thasmorato-skills:tm-tickets` → the per-ticket loop |
| **Small** | one seam, no architectural question, fits in a ticket or two | write the ticket(s) and `request-trace.md` (the format is in `$thasmorato-skills:tm-tickets`, step 4), then straight to `$thasmorato-skills:tm-design` → `$thasmorato-skills:tm-plan` → `$thasmorato-skills:tm-plan-validate` → `$thasmorato-skills:tm-implement` → `$thasmorato-skills:tm-review` → `$thasmorato-skills:tm-acceptance`, no FDD |
| **Direct** | a fix or a change whose shape is already obvious | no stage at all; say so and let the user just do it. A cleanup of existing, tested code is `$thasmorato-skills:tm-tidy <path>` |

**Say which gear you chose and why, and confirm it** before running anything. Choosing a gear is a decision the user should get to overrule in either direction, and it is far cheaper to move up a gear after discovering a real design question than to unwind a week of documents produced for a small task.

**Record the choice where a later scan can see it.** When a ticket is written without an FDD, its `Source` says so (`direct (small gear, no FDD): single seam, no contract change`) so the scan can tell a deliberate skip from a missing document. An unrecorded skip reads exactly like an omission, and the next run will offer to fill it.

**Record the gear itself, too.** Every ticket carries it in its frontmatter's `gear` field (the small gear's ticket too, with its `type` and `acs`), and `$thasmorato-skills:tm-plan` copies it into the plan's frontmatter, because the stages below run standalone and cannot ask this command. It is also what lets `$thasmorato-skills:tm-retro` measure each gear separately, and tell whether the gear chosen matched the size the work turned out to be.

The instinct to reach for the full chain on everything is the same instinct Shape Up's *appetite* corrects: the question is not "what is the complete process?", it is "how much process does this problem deserve?".

## Checks that go stale on their own
Some artifacts are true when written and drift without anyone touching them. The scan detects that drift and **asks**. It never re-runs a stage on its own, and it asks only in the **Full** and **Feature** gears: in a Small task the interruption costs more than the check, and the warning comes back the next time a larger gear runs.

| Artifact | Stale when | Offer |
|---|---|---|
| `docs/analysis/dependencies.md` | a lockfile in its `lockfiles` changed after `audited_commit` (`git log <audited_commit>..HEAD -- <lockfiles>`), **or** `audited_at` is more than **30 days** old | `$thasmorato-skills:tm-audit-deps` |
| `docs/analysis/dependency-graph.md` | a commit by **someone else** landed after `measured_commit` (`git log <measured_commit>..HEAD --format=%ae`, against `git config user.email`). The structure moved in ways no review in this flow saw | `$thasmorato-skills:tm-reconcile` |

Say which signal fired, and what it means. A changed lockfile means the audit describes dependencies the project no longer has. An old date means new advisories may exist against the same lockfile, because dependencies drift when the world changes, not only when the code does. An audit without these fields predates them: report its age as unknown and offer the re-run once.

Offer `$thasmorato-skills:tm-reconcile` only when `docs/architecture/components.md` exists. A project that does not have its structure documents yet has nothing to reconcile against, and a missing artifact is not automatically a gap.

## Resolving the argument
- **No argument** → the whole project. Report what's missing and what's pending approval. This is the most frequent use.
- **An argument** → try to match it against an existing FDD, feature id, ticket slug, or epic. **Matches → resume** and report where that thing stopped. **No match → treat it as a new goal, and confirm that with the user before starting from scratch**; free text against slugs is a fuzzy match, and starting a new flow over an existing one is expensive to undo.

## Brownfield
Detect by objective signal (source files outside `docs/`, or a git history with commits) and **confirm with the user** rather than deciding alone; getting this wrong changes every stage below.

Brownfield is a **modifier on every stage**, not a prefix. `$thasmorato-skills:tm-analyze` runs first and writes `docs/analysis/system-profile.md`; every later stage reads that file **if it exists** and discovers on its own if it doesn't. The profile accelerates, it never gates. Concretely: `$thasmorato-skills:tm-interview` asks what cannot change, `$thasmorato-skills:tm-prd` states whether requirements are the delta or the whole system, `$thasmorato-skills:tm-hld` documents the AS-IS and marks the delta, `$thasmorato-skills:tm-components` measures the real graph, `$thasmorato-skills:tm-boundaries` reports divergence between the contract and the code, `$thasmorato-skills:tm-guidelines` mines real conventions, `$thasmorato-skills:tm-tickets` plans migration sequences, and `$thasmorato-skills:tm-review` holds the diff to the repo's own conventions.

## Phase 1: Documentation
1. `$thasmorato-skills:tm-analyze` (+ `$thasmorato-skills:tm-audit-deps`) if brownfield, then `$thasmorato-skills:tm-guidelines` + `$thasmorato-skills:tm-generate-stack-guide <tech>` per technology right away, since the stack is already in the repo, and `$thasmorato-skills:tm-guardrails` when the repo has no pre-commit hook or CI running its checks.
2. `$thasmorato-skills:tm-interview` → brief + glossary + inline ADRs. **GATE (ambiguity):** every required section filled, and the user confirms the shared understanding.
3. Optional `$thasmorato-skills:tm-research` for open technical questions.
4. `$thasmorato-skills:tm-prd` → `$thasmorato-skills:tm-doc-validate brief prd`. **GATE (strong):** a wrong PRD contaminates everything below.
5. `$thasmorato-skills:tm-hld` (+ `$thasmorato-skills:tm-c4-generate` for C1/C2) → `$thasmorato-skills:tm-doc-validate prd hld`. **GATE (strong).** In greenfield, this is where the stack is decided: propose `$thasmorato-skills:tm-guidelines` + `$thasmorato-skills:tm-generate-stack-guide <tech>` now, before `$thasmorato-skills:tm-components`.
6. `$thasmorato-skills:tm-components` → `$thasmorato-skills:tm-doc-validate hld components` (+ `$thasmorato-skills:tm-c4-generate` for the system C3). **GATE (strong):** every FDD below uses these names.
7. `$thasmorato-skills:tm-decompose` → `$thasmorato-skills:tm-doc-validate prd features`. **GATE (medium):** look at uncovered requirements first.
8. `$thasmorato-skills:tm-fdd <feature>` per feature (+ `$thasmorato-skills:tm-mermaid-generate`) → `$thasmorato-skills:tm-doc-validate features fdd`. **GATE (per feature, medium).** Independent features can be specced in parallel.
9. `$thasmorato-skills:tm-boundaries`. **GATE (strong):** every ticket below is sliced against this. Then `$thasmorato-skills:tm-guardrails` (its dependency-linter item) can turn the contract into forbidden imports that fail the build.
10. `$thasmorato-skills:tm-adr-identify` → confirm → `$thasmorato-skills:tm-adr-generate` → `$thasmorato-skills:tm-adr-link`.
11. Propose `$thasmorato-skills:tm-guidelines` again only if the FDDs or ADRs brought in a technology its stack table does not list.

**Two architecture beats, deliberately apart.** `$thasmorato-skills:tm-components` runs **before** the FDDs so every feature spec shares one vocabulary; `$thasmorato-skills:tm-boundaries` runs **after** them, because the axes of change a boundary separates are only knowable once the features are specced. Reversing the first would make the map a reconciliation of N contradictory carve-ups; moving the second earlier would make it a guess.

**The guides come before both.** `$thasmorato-skills:tm-components` and `$thasmorato-skills:tm-boundaries` both have to know what a component *is* in this ecosystem (a Rails engine, an Nx package, a Go module) and that is written in the stack guide, not in the abstract principle. So the guides are generated as soon as the stack is known: after `$thasmorato-skills:tm-analyze` in brownfield, after `$thasmorato-skills:tm-hld` in greenfield. Generated last, they reach the code stages but miss the two stages that draw the structure.

## Phase 2: Development (per frontier ticket)
12. `$thasmorato-skills:tm-tickets <feature>` → vertical slices with blocking edges, validated as a set by `$thasmorato-skills:tm-tickets-validate` before the gate. **GATE:** the set must be `clean`, and the tickets-to-seams count is the first thing to read.
13. Per frontier ticket: `$thasmorato-skills:tm-design` → **GATE** → `$thasmorato-skills:tm-plan` → `$thasmorato-skills:tm-plan-validate` (**GATE:** must be `clean`) → `$thasmorato-skills:tm-implement` (SI by SI, STOP between SIs; recommend `/effort xhigh` before it, the level for demanding agentic code: `max` is not the default, and when `xhigh` falls short the next step is a stronger model, then `max`) → optional `$thasmorato-skills:tm-trim <slug> <fixed-point>`: make the change smaller with the behavior identical, so the review reads less → `$thasmorato-skills:tm-review <fixed-point>` → **GATE** → optional `$thasmorato-skills:tm-tidy <slug> <fixed-point>`: the four rules of Simple Design over what is left → `$thasmorato-skills:tm-acceptance <slug>`: every AC and request part checked in the running software, after the last change to production code → optional `$thasmorato-skills:tm-walkthrough <slug> <fixed-point>`: a lesson over the change with a recall quiz, so the owner understands what merges → `$thasmorato-skills:tm-pr <slug> <fixed-point>`: the PR body (summary as a picture, before/after evidence, merge danger), opened only when the user says so. Both are structural, apply only what the user chooses, and run in every gear that has a review.
    - **Back-edge:** if implementation surfaces a real architectural decision, propose `$thasmorato-skills:tm-adr-identify` and an FDD update, and if it revealed a new axis of change, revisit `$thasmorato-skills:tm-boundaries`. Keep the docs live.
    - **Screens:** a ticket that builds a new screen with nothing to copy (no Figma, prototype, image or existing page) runs `$thasmorato-skills:tm-ui-design <screen>` before `$thasmorato-skills:tm-design`; a redesign runs `$thasmorato-skills:tm-ui-audit <screen>` first, then `$thasmorato-skills:tm-ui-design`. A screen with a spec in its feature's `ui/` goes straight to `$thasmorato-skills:tm-design`.
    - **Bugs:** a bug whose cause is not known starts at `$thasmorato-skills:tm-diagnose`, never at a fix. It ends with the cause and the pinned and flipped tests; an obvious fix is then made test-first (Direct), anything larger becomes a `Type: bugfix` ticket whose Source is the diagnosis, through `$thasmorato-skills:tm-design` → `$thasmorato-skills:tm-plan` in the Small gear.
14. When an epic or a cycle finishes: `$thasmorato-skills:tm-retro <epic>`. Every other stage writes forward; this is the only one that writes back, reading what the work left on disk and recording what it taught: process findings to `docs/retro/`, product findings to `docs/evolutions.md`. Run it over a set of tickets, never one: a single ticket has no repetition to find, and repetition is what separates an incident from a standard worth moving into a guide.
15. When a working session ends, whether a whole flow driven through several `/compact`s or a long stretch of work: `$thasmorato-skills:tm-session-analyze`. `$thasmorato-skills:tm-retro` reads the artifacts; this reads what only the conversation holds (the owner correcting, rejecting, repeating), across every compaction segment, and tags each finding `flow` (improve the plugin) or `project` (a skill or guide here). It owns the environment lens: what got in the way (navigation, tool economy, missing information, instructions that did not hold).
16. When planning the plugin's next version: `$thasmorato-skills:tm-flow-report <projects>` reads the `flow`-tagged findings of several projects' retros and meta-retros, groups them by the stage they would change, and puts the measurements side by side per `plugin_version`.

## Parallelism: fan out on reads, stay serial on writes
- ✅ **Fan out** for documentation, codebase exploration and review: read-only work where agents don't collide and results add up. Already the case for `$thasmorato-skills:tm-review`, independent FDDs, and the `$thasmorato-skills:tm-analyze` component pass.
- ❌ **Implementation is serial in the main context.** Writes conflict, and the code deserves supervision.
- 🔀 **Real parallelism happens per epic, in worktrees.** The effort's `decomposition.md` carries each epic's parallel-safe set, derived from component overlap, so "can these two run at once" is a lookup, not a guess.

Each stage reports when it ends, and `$thasmorato-skills:tm-flow` again shows where the project stands and what comes next; the user can stop, redirect, or jump stages at any gate.
