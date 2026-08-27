---
description: Break an FDD into tracer-bullet tickets with blocking edges, then publish them (local files or a real tracker).
argument-hint: <feature name or slug> (or a path/issue reference)
---

Break the feature's design into a set of **tickets** — tracer-bullet vertical slices, each declaring the tickets that **block** it. This is interactive: quiz the user before publishing anything.

## 1. Gather context
Read `docs/fdd/<feature>.md` for: $ARGUMENTS (or the reference passed as an argument). Also read the relevant `docs/adr/*.md` and `CONTEXT.md` — ticket titles and descriptions use the project's glossary and respect the ADRs in the area you're touching. If no FDD exists, tell the user to run `/fdd` first.

## 2. Explore the codebase (optional)
Understand the current state. Look for **prefactoring** opportunities — "make the change easy, then make the easy change."

## 3. Draft vertical slices
Each slice cuts a **narrow but complete** path through every layer (schema, API, UI, tests) — vertical, never a horizontal slice of one layer. A completed slice is **demoable on its own** and fits one fresh context window. Prefactoring goes first. Give each ticket its **blocking edges** (the tickets that must complete before it can start).

**Wide-refactor exception:** a single mechanical change whose blast radius breaks thousands of call sites can't land green as a vertical slice. Sequence it **expand → migrate (batches, each blocked by expand) → contract (blocked by every batch)**; if batches can't stay green alone, share an integration branch that all block a final integrate-and-verify ticket.

## 4. Quiz the user
Present the breakdown as a numbered list — per ticket: **Title**, **Blocked by**, **What it delivers** (the end-to-end behavior). Ask: is the granularity right? are the blocking edges correct (only genuine gates)? should any be merged or split? Iterate until the user approves.

## 5. Publish (blockers first)
Default to **local files** — one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order. If the user asks for a real tracker (GitHub, etc.) and a remote exists, publish one issue per ticket in dependency order using native blocking links, and apply a `ready-for-agent` label. Never close or modify a parent issue.

Per-ticket format (avoid file paths/code snippets — they go stale; exception: a decision-encoding snippet from a prototype, trimmed to the decision):
```
# <NN> — <Ticket title>

**What to build:** the end-to-end behavior this ticket makes work, from the user's perspective — not a layer-by-layer list.
**Blocked by:** the tickets that gate this one, or "None — can start immediately".
**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
```

Work the **frontier** — any ticket whose blockers are all done — one ticket per fresh context: `/design` → `/plan` → `/plan-validate` → `/implement`.
