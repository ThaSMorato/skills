---
description: Break one ticket into a validated implementation plan, vertical SIs with tests, dependencies, and acceptance criteria.
argument-hint: "<ticket file/number, or the work to plan> [amend \"<the change>\"]"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/ticket-plan/SKILL.md` and follow it to turn this into an implementation plan: $ARGUMENTS

Read the ticket (or the work the user points to) plus the node map, the FDD, the boundary contract, ADRs, guidelines, and `CONTEXT.md`.

**Re-entry:** when the plan exists, read its `validation.md` first: a `dirty` one is revised against its findings without asking. With `amend "<the change>"`, or when `progress.md` shows SIs done, the plan is amended in place: done SIs are frozen, a new SI takes the next id, `revision` goes up.

**Preflight:** the node map must exist at `.scratch/<feature-slug>/design/<NN>-<slug>.md`. If it doesn't, stop and tell the user to run `/tm-design <ticket>` first; designing inside this command collapses two gates into one and leaves the design contract unwritten. Then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/blocker-state.mjs" <ticket file>`: a blocker that is not `merged` or `done` is said before slicing, with its state.

Slice the work into vertical Step Implementations, coarse by default (1 to 3 at small gear), each acceptance criterion owned by id, confirm the granularity and seams with the user (record their choice in `## Slicing`), and write the plan to `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

Then tell the user to run `/tm-plan-validate <slug>` before implementing. The report names one next command: a plan of one SI has one start, not one for the plan and another for its SI.
