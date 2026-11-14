---
name: tm-plan-validate
description: "Validate an implementation plan before coding (gaps, ambiguity, dependency cycles, untestable criteria) and emit a clean/dirty verdict that gates $thasmorato-skills:tm-implement."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <plan slug, e.g. 03-checkout>


Read `references/skills/plan-validate/index.md` and follow it to validate the plan for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Read the plan and everything it answers to (the ticket, the node map it points at, the FDD, the ADRs, the boundary contract) and the repository behind it (the scripts and CI the Deliverables name, the installed source of the libraries the tests rely on), and scan for issues: inconsistencies, ambiguities, dependency gaps and cycles, untestable acceptance criteria, coverage gaps, SIs too big or too small, SIs that own no criterion, dispersion, divergence from the node map, deliverable commands the repo does not have, consequences of a requirement no SI handles, and criteria nobody can check with this ticket and its blockers. Write `validation.md` with a `status: clean | dirty` verdict and the `plan_sha256` of the plan it judged.

If dirty, report exactly what to fix. If clean, show what changed since the owner approved the slicing (when the plan was revised), then tell the user to run `$thasmorato-skills:tm-implement <slug>`, and stop. A slicing the owner decided (`## Slicing`) is not re-opened by the size and balance checks.
