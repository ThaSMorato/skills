---
description: Break an FDD into tracer-bullet tickets with blocking edges, then publish them (local files or a real tracker).
argument-hint: "<feature name or slug> (or a path/issue reference)"
---

Break the feature's design into a set of **tickets** — tracer-bullet vertical slices, each declaring the tickets that **block** it. This is interactive: quiz the user before publishing anything.

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

A ticket may be executed by an agent **or picked up by the owner**, so it carries the why and the constraints, not only the instruction. `${CLAUDE_PLUGIN_ROOT}/templates/ticket.md` is the contract.

## 1. Gather context
Read `docs/fdd/<feature>.md` for: $ARGUMENTS (or the reference passed as an argument). Also read `docs/boundaries.md` (the components this feature may touch and the edges it may add), the relevant `docs/adr/*.md`, and `CONTEXT.md`. If no FDD exists, tell the user to run `/fdd` first.

Read this feature's row in `docs/features.md` too, if it exists. You can only see **one** feature's FDD, so its **`Depends on`** column is the only place a cross-feature blocker is written down — a ticket here that needs something another feature delivers must say so, even though that blocker lives outside the graph you are about to build. Its **`Not delivering`** bound feeds the tickets' exclusions.

## 2. Explore the codebase
**Required whenever code exists** — optional only on an empty repository. A ticket written without looking asks for things that are already built, and every stage below it elaborates that request instead of questioning it.

For each capability the FDD describes, grep the domain nouns and the likely symbol names before writing a ticket that says "build". Then say, per ticket, **what already exists that it can reuse** — and where the answer is "most of it", the ticket is a wiring job and should be written as one.

Look for **prefactoring** opportunities too — "make the change easy, then make the easy change."

## 3. Draft vertical slices
Each slice cuts a **narrow but complete** path through every layer (schema, API, UI, tests) — vertical, never a horizontal slice of one layer. A completed slice is **demoable on its own**. Prefactoring goes first. Give each ticket its **blocking edges**.

**Size by the seam.** The FDD declares its test seams in a required section; **one ticket crosses one seam end to end**. That is observable at planning time, comparable between tickets, and already written down — unlike "fits one context window", which is none of those and which the SI-based implement loop made obsolete anyway (the unit that must fit a context is the SI, not the ticket). Where a feature has one seam for everything, fall back to a range of 2–5 acceptance criteria per ticket.

**Size relatively.** After drafting, put the tickets side by side and compare them to each other, not to an absolute limit. Comparison is far more reliable than estimation, for a model and for a person, and dispersion is what actually goes wrong here.

**Mark the type.** A **structural** ticket (prefactoring, expand/migrate/contract) changes shape and not behavior: existing tests stay unchanged and stay green, and that is verifiable at review. A **behavioral** ticket changes what the system does.

**Wide-refactor exception:** a single mechanical change whose blast radius breaks thousands of call sites can't land green as a vertical slice. Sequence it **expand → migrate (batches, each blocked by expand) → contract (blocked by every batch)** — all structural; if batches can't stay green alone, share an integration branch that all block a final integrate-and-verify ticket.

## 4. Check the set, then quiz the user
Before presenting, check two things mechanically:

- **Cycles.** Walk the blocking graph. A cycle means no ticket ever has all its blockers done and the frontier is empty forever — it is the Acyclic Dependencies Principle at ticket scale, and it is trivial to detect and invisible to read. Report any cycle as its full path and break it before presenting.
- **Coverage.** Every acceptance criterion in the FDD is owned by at least one ticket. Anything uncovered is either a missing ticket or an out-of-scope decision that should be written down.

Then present the breakdown as a numbered list — per ticket: **Title**, **Type**, **Seam**, **Blocked by**, **What it delivers**. Ask:
1. Is the granularity right?
2. **Are these comparable to each other?** — show the sizes side by side; this is the question that catches dispersion, and asking only about the set as a whole never does.
3. Are the blocking edges genuine gates?
4. Should any be merged or split?

Iterate until the user approves.

## 5. Publish (blockers first)
Default to **local files** — one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order, each filling `${CLAUDE_PLUGIN_ROOT}/templates/ticket.md`. Number the acceptance criteria `AC-1`, `AC-2` — `/plan` maps each to an SI and `/plan-validate` checks the coverage by id, which it cannot do against unlabelled bullets.

If the user asks for a real tracker (GitHub, etc.) and a remote exists, publish one issue per ticket in dependency order using native blocking links. Never close or modify a parent issue.

Avoid file paths and code snippets — they go stale; the exception is a decision-encoding snippet from a prototype, trimmed to the decision.

`Status` starts `ready` for unblocked tickets and `blocked` for the rest. It records **readiness, not who executes** — the old `ready-for-agent` presumed the executor, and the owner picking the ticket up made the field a lie.

Work the **frontier** — any ticket whose blockers are all done: `/design` → `/plan` → `/plan-validate` → `/implement` → `/review`.
