---
name: plan
description: Break one ticket into a validated implementation plan — vertical Step Implementations (SIs) with tests, dependencies, and acceptance criteria, ready for the SI-by-SI implement loop. Use before implementing a ticket, on "plan this ticket / break this into steps", or right after /design.
disable-model-invocation: true
---

Turn one ticket into a **plan** the `implement` loop can execute SI by SI. This skill decides *how* the work is sliced; it does not write production code and it does not make the design decisions.

## 1. Gather context
Read the ticket (`.scratch/<feature-slug>/issues/<NN>-<slug>.md` or the reference passed as an argument) plus the docs that constrain it: the **node map** (`.scratch/<feature-slug>/design/<NN>-<slug>.md`), the feature spec (`docs/fdd/*.md`), the boundary contract (`docs/boundaries.md`), the decisions (`docs/adr/*.md`), the repo standard (`docs/guidelines.md`, plus the stack guides its routing table names for the files involved), and the glossary (`CONTEXT.md`). SI names and interface vocabulary come from the glossary; the ADRs, the boundary contract and the guidelines are binding in the area you touch.

**If there is no node map, stop** and tell the user to run `/design <ticket>` first. Do not design inside this skill: the two stages have separate gates, and collapsing them means the user confirms the map and the slicing in one breath, with the map never written down.

## 2. Slice into Step Implementations
An **SI** is one **vertical tracer-bullet slice** — a narrow but complete path through the layers it touches, sized for a single red → green → refactor cycle that fits one fresh context. Never slice horizontally (all of one layer, then the next).

For each SI, write down: **Description**, **Technical actions** (ordered), **Tests** (which seams/layers, per the `testing` skill — or `none — <reason>` for a pure-infra SI), **Dependencies** (other SIs that gate it), **Acceptance criteria** (observable outcomes, each naming the **ticket AC id** it serves). Tests go at **pre-agreed seams** — name them here so the implement loop writes the failing test first.

The SIs implement the node map's nodes: an SI that introduces a module the map does not have, or gives it a different interface, is a divergence to resolve now — go back to `/design` rather than quietly redesigning here.

**A structural ticket plans differently.** When the ticket's `Type` is `structural`, the plan carries the rule explicitly: behavior is unchanged, existing tests are **not modified**, and they stay green throughout. There is no red step for a slice that adds no behavior — the existing suite is the test.

Prefactoring SIs go first ("make the change easy, then make the easy change"). Then build the **Dependency Map** and the **Deliverables** checklist. The full format is in `PLAN-FORMAT.md` — follow it exactly.

## 3. Confirm, then emit
Present the SI breakdown to the user — per SI: name, what it delivers, its blockers. Ask whether the granularity and the seams are right; iterate until they approve. Then write the plan to `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

Every acceptance criterion in the ticket must be owned by at least one SI, **by id**, and every SI's tests must make its acceptance criteria observable. If either fails, the slicing is wrong — fix it before writing.

## 4. Validate
Tell the user to run `/plan-validate <slug>` next. The plan is not ready for `/implement` until validation reports `status: clean`.
