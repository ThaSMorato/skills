---
description: Drive the Doc-Dev flow — scan where the project stands, report what's waiting, and run the next stage with human gates.
argument-hint: "(none) — whole project · or <feature/ticket/goal> to scope to one thing"
---

You are the **coordinator**. Scope: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Always scan first — before running anything
The first thing this command does, every time, is **read the disk and say where the project stands**. Not "start at stage one": scan, report, then propose. This is the most common way the command is used — "where am I, what's next, what's waiting on me" — and running a stage before answering that is how work gets redone.

State derives from **artifacts on disk**, never from a status file this command maintains. Every artifact is a by-product of whoever did the work, so nothing owes an update to a document that isn't theirs, and any subcommand can run standalone without knowing this command exists. A state file would have to be written by stages that don't own it, and a state file that lies is worse than none.

### Phase 1 — linear: does it exist, and is it approved?
Presence proves **produced**; the artifact's own `Status:` frontmatter proves **approved**. Read both.

| Artifact | Stage | Command |
|---|---|---|
| `docs/analysis/system-profile.md`, `docs/analysis/architecture.md` | brownfield analysis | `/analyze` |
| `docs/analysis/dependencies.md` | dependency audit | `/audit-deps` |
| `docs/requirements-brief.md` + `CONTEXT.md` | interview | `/interview` |
| `docs/research/*.md` | research (optional) | `/research` |
| `docs/prd.md` | PRD | `/prd` |
| `docs/hld.md` | HLD | `/hld` |
| `docs/components.md` | component map | `/components` |
| `docs/features.md` | decomposition | `/decompose` |
| `docs/evolutions.md` | findings kept but traced to no requirement — read it when scope is next revisited | `/decompose`, `/retro` append |
| `docs/retro/*.md` | what finished work taught about the process | `/retro` |
| `docs/fdd/<feature>.md` | FDD, per feature | `/fdd <feature>` |
| `docs/boundaries.md` | boundary contract | `/boundaries` |
| `docs/adr/*.md`, `docs/adr/potential/*.md` | ADRs (pending ones are `state: proposed`) | `/adr-identify` → `/adr-generate` |
| `docs/guidelines.md`, `.claude/skills/*-guide/` | guidelines router + stack guides | `/guidelines`, `/generate-stack-guide` |
| `docs/validation/*.md` | doc validation verdicts | `/doc-validate` |
| `.scratch/<feature>/issues/` | tickets | `/tickets <feature>` |
| `.scratch/<feature>/tickets-validation.md` | the ticket set's verdict, `clean` or `dirty` | `/tickets-validate <feature>` (the postflight of `/tickets`) |

**A missing artifact is not automatically a gap.** Before reporting one as missing, check whether a ticket's `Source` records it as a deliberate skip — small work legitimately has no FDD. Report a skip as a skip; offering to generate a document the user consciously declined is how a coordinator teaches people to stop reading it.

### Phase 2 — a matrix, not a stage
Phase 2 is a **loop per ticket**, so "the next step" is *which ticket, and which sub-stage it stopped at*. Build this table from the sibling artifacts:

| ticket | design | plan | validate | implement | review |
|---|---|---|---|---|---|
| `01-auth` | ✅ | ✅ | ✅ clean | 3/5 SIs | — |
| `02-profile` | ✅ | ✅ | ⚠️ dirty | — | — |
| `03-billing` | — | — | — | — | — |

- **design** — `.scratch/<feature>/design/<NN>-<slug>.md` exists
- **plan** — `plans/<NN>-<slug>/plan.md` exists
- **validate** — `validation.md`'s `status:` frontmatter
- **implement** — `progress.md`'s `sis_done`/`sis_total` frontmatter (a `progress.md` without frontmatter predates it — read the count from the body and say so)
- **review** — `.scratch/<feature>/reviews/<NN>-<slug>.md` exists; its `verdicts` say how many findings the verifier confirmed

The **frontier** is the tickets whose blockers are all `done`, crossed with where each stopped.

### Then report
Announce, in this order: **where the project stands**, **what is waiting for your approval** (artifacts whose `Status` is `draft` or `in review`, and any `dirty` validation), and **the next stage** — then ask before running it.

## Then size the work, and pick the shortest path that fits
**Before proposing any stage, decide how big this is.** The full chain exists for work whose shape is genuinely unknown. Run it on a two-hour change and it does not merely cost more — it *manufactures* scope, because every template below is a completeness contract, and a completeness contract applied to a small task gets filled with invented content. The machine that makes omission detectable is the same machine that produces bulk.

| Gear | When | Path |
|---|---|---|
| **Full** | a new product, or an epic whose structure is unknown | everything, phase 1 → phase 2 |
| **Feature** | a feature inside a product that already has a PRD, HLD and component map | `/fdd` → `/tickets` → the per-ticket loop |
| **Small** | one seam, no architectural question, fits in a ticket or two | straight to `/design` → `/plan` → `/plan-validate` → `/implement` → `/review`, no FDD |
| **Direct** | a fix or a change whose shape is already obvious | no stage at all — say so and let the user just do it |

**Say which gear you chose and why, and confirm it** before running anything. Choosing a gear is a decision the user should get to overrule in either direction — and it is far cheaper to move up a gear after discovering a real design question than to unwind a week of documents produced for a small task.

**Record the choice where a later scan can see it.** When a ticket is written without an FDD, its `Source` says so — `direct — small gear, no FDD: single seam, no contract change` — so the scan can tell a deliberate skip from a missing document. An unrecorded skip reads exactly like an omission, and the next run will offer to fill it.

**Record the gear itself, too.** Every ticket carries it in its `Gear` field, and `/plan` copies it into the plan's frontmatter, because the stages below run standalone and cannot ask this command. It is also what lets `/retro` measure each gear separately — and tell whether the gear chosen matched the size the work turned out to be.

The instinct to reach for the full chain on everything is the same instinct Shape Up's *appetite* corrects: the question is not "what is the complete process?", it is "how much process does this problem deserve?".

## Checks that go stale on their own
Some artifacts are true when written and drift without anyone touching them. The scan detects that drift and **asks**. It never re-runs a stage on its own, and it asks only in the **Full** and **Feature** gears: in a Small task the interruption costs more than the check, and the warning comes back the next time a larger gear runs.

| Artifact | Stale when | Offer |
|---|---|---|
| `docs/analysis/dependencies.md` | a lockfile in its `lockfiles` changed after `audited_commit` (`git log <audited_commit>..HEAD -- <lockfiles>`), **or** `audited_at` is more than **30 days** old | `/audit-deps` |

Say which signal fired, and what it means. A changed lockfile means the audit describes dependencies the project no longer has. An old date means new advisories may exist against the same lockfile, because dependencies drift when the world changes, not only when the code does. An audit without these fields predates them: report its age as unknown and offer the re-run once.

## Resolving the argument
- **No argument** → the whole project. Report what's missing and what's pending approval. This is the most frequent use.
- **An argument** → try to match it against an existing FDD, feature id, ticket slug, or epic. **Matches → resume** and report where that thing stopped. **No match → treat it as a new goal, and confirm that with the user before starting from scratch**; free text against slugs is a fuzzy match, and starting a new flow over an existing one is expensive to undo.

## Brownfield
Detect by objective signal — source files outside `docs/`, or a git history with commits — and **confirm with the user** rather than deciding alone; getting this wrong changes every stage below.

Brownfield is a **modifier on every stage**, not a prefix. `/analyze` runs first and writes `docs/analysis/system-profile.md`; every later stage reads that file **if it exists** and discovers on its own if it doesn't. The profile accelerates, it never gates. Concretely: `/interview` asks what cannot change, `/prd` states whether requirements are the delta or the whole system, `/hld` documents the AS-IS and marks the delta, `/components` measures the real graph, `/boundaries` reports divergence between the contract and the code, `/guidelines` mines real conventions, `/tickets` plans migration sequences, and `/review` holds the diff to the repo's own conventions.

## Phase 1 — Documentation
1. `/analyze` (+ `/audit-deps`) if brownfield — then `/guidelines` + `/generate-stack-guide <tech>` per technology right away, since the stack is already in the repo.
2. `/interview` → brief + glossary + inline ADRs. **GATE (ambiguity):** every required section filled, and the user confirms the shared understanding.
3. Optional `/research` for open technical questions.
4. `/prd` → `/doc-validate brief prd`. **GATE (strong):** a wrong PRD contaminates everything below.
5. `/hld` (+ `/c4-generate` for C1/C2) → `/doc-validate prd hld`. **GATE (strong).** In greenfield, this is where the stack is decided: run `/guidelines` + `/generate-stack-guide <tech>` now, before `/components`.
6. `/components` → `/doc-validate hld components` (+ `/c4-generate` for the system C3). **GATE (strong):** every FDD below uses these names.
7. `/decompose` → `/doc-validate prd features`. **GATE (medium):** look at uncovered requirements first.
8. `/fdd <feature>` per feature (+ `/mermaid-generate`) → `/doc-validate features fdd`. **GATE (per feature, medium).** Independent features can be specced in parallel.
9. `/boundaries`. **GATE (strong):** every ticket below is sliced against this.
10. `/adr-identify` → confirm → `/adr-generate` → `/adr-link`.
11. Re-run `/guidelines` only if the FDDs or ADRs brought in a technology its stack table does not list.

**Two architecture beats, deliberately apart.** `/components` runs **before** the FDDs so every feature spec shares one vocabulary; `/boundaries` runs **after** them, because the axes of change a boundary separates are only knowable once the features are specced. Reversing the first would make the map a reconciliation of N contradictory carve-ups; moving the second earlier would make it a guess.

**The guides come before both.** `/components` and `/boundaries` both have to know what a component *is* in this ecosystem — a Rails engine, an Nx package, a Go module — and that is written in the stack guide, not in the abstract principle. So the guides are generated as soon as the stack is known: after `/analyze` in brownfield, after `/hld` in greenfield. Generated last, they reach the code stages but miss the two stages that draw the structure.

## Phase 2 — Development (per frontier ticket)
12. `/tickets <feature>` → vertical slices with blocking edges, validated as a set by `/tickets-validate` before the gate. **GATE:** the set must be `clean`, and the tickets-to-seams count is the first thing to read.
13. Per frontier ticket: `/design` → **GATE** → `/plan` → `/plan-validate` (**GATE:** must be `clean`) → `/implement` (SI by SI, STOP between SIs) → `/review <fixed-point>` → **GATE**.
    - **Back-edge:** if implementation surfaces a real architectural decision, run `/adr-identify` and update the FDD — and if it revealed a new axis of change, revisit `/boundaries`. Keep the docs live.
14. When an epic or a cycle finishes: `/retro <epic>`. Every other stage writes forward; this is the only one that writes back, reading what the work left on disk and recording what it taught — process findings to `docs/retro/`, product findings to `docs/evolutions.md`. Run it over a set of tickets, never one: a single ticket has no repetition to find, and repetition is what separates an incident from a standard worth moving into a guide.

## Parallelism: fan out on reads, stay serial on writes
- ✅ **Fan out** for documentation, codebase exploration and review — read-only work where agents don't collide and results add up. Already the case for `/review`, independent FDDs, and the `/analyze` component pass.
- ❌ **Implementation is serial in the main context.** Writes conflict, and the code deserves supervision.
- 🔀 **Real parallelism happens per epic, in worktrees.** `docs/features.md` carries each epic's parallel-safe set, derived from component overlap — so "can these two run at once" is a lookup, not a guess.

Report progress after each stage. The user can stop, redirect, or jump stages at any gate.
