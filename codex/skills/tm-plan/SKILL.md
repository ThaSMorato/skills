---
name: tm-plan
description: "Break one ticket into a validated implementation plan, vertical SIs with tests, dependencies, and acceptance criteria."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <ticket file/number, or the work to plan>


Read the `ticket-plan` skill (`references/skills/ticket-plan/SKILL.md`) to turn this into an implementation plan: the text after the skill name

Read the ticket (or the work the user points to) plus the node map, the FDD, the boundary contract, ADRs, guidelines, and `CONTEXT.md`.

**Preflight:** the node map must exist at `.scratch/<feature-slug>/design/<NN>-<slug>.md`. If it doesn't, stop and tell the user to run `$thasmorato-skills:tm-design <ticket>` first; designing inside this command collapses two gates into one and leaves the design contract unwritten.

Slice the work into vertical Step Implementations, coarse by default (1 to 3 at small gear), each acceptance criterion owned by id, confirm the granularity and seams with the user (record their choice in `## Slicing`), and write the plan to `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

Then tell the user to run `$thasmorato-skills:tm-plan-validate <slug>` before implementing.
