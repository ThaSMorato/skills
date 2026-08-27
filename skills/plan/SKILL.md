---
name: plan
description: Break one ticket into a validated implementation plan — vertical Step Implementations (SIs) with tests, dependencies, and acceptance criteria, ready for the SI-by-SI implement loop. Use before implementing a ticket, on "plan this ticket / break this into steps", or right after /design.
disable-model-invocation: true
---

Turn one ticket into a **plan** the `implement` loop can execute SI by SI. This skill decides *how* the work is sliced; it does not write production code.

## 1. Gather context
Read the ticket (`.scratch/<feature-slug>/issues/<NN>-<slug>.md` or the reference passed as an argument) plus the docs that constrain it: the feature spec (`docs/fdd/*.md`), the decisions (`docs/adr/*.md`), the repo standard (`docs/guidelines.md`), and the glossary (`CONTEXT.md`). SI names and interface vocabulary come from the glossary; the ADRs and guidelines are binding in the area you touch.

If there is no **node map** for this work yet, run the `design` skill first — the plan encodes the node map's decisions (deep modules, seams, interfaces). Confirm the map with the user before slicing.

## 2. Slice into Step Implementations
An **SI** is one **vertical tracer-bullet slice** — a narrow but complete path through the layers it touches, sized for a single red → green → refactor cycle that fits one fresh context. Never slice horizontally (all of one layer, then the next).

For each SI, write down: **Description**, **Technical actions** (ordered), **Tests** (which seams/layers, per the `testing` skill — or `none — <reason>` for a pure-infra SI), **Dependencies** (other SIs that gate it), **Acceptance criteria** (observable outcomes tracing back to the ticket's ACs). Tests go at **pre-agreed seams** — name them here so the implement loop writes the failing test first.

Prefactoring SIs go first ("make the change easy, then make the easy change"). Then build the **Dependency Map** and the **Deliverables** checklist. The full format is in `PLAN-FORMAT.md` — follow it exactly.

## 3. Confirm, then emit
Present the SI breakdown to the user — per SI: name, what it delivers, its blockers. Ask whether the granularity and the seams are right; iterate until they approve. Then write the plan to `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

Every acceptance criterion in the ticket must be owned by at least one SI, and every SI's tests must make its acceptance criteria observable. If either fails, the slicing is wrong — fix it before writing.

## 4. Validate
Tell the user to run `/plan-validate <slug>` next. The plan is not ready for `/implement` until validation reports `status: clean`.
