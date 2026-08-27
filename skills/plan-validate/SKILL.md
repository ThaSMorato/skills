---
name: plan-validate
description: Validate an implementation plan before coding — check the SIs for gaps, ambiguity, dependency cycles, and untestable acceptance criteria, and emit a clean/dirty verdict that gates /implement. Use after /plan, on "validate the plan / is this plan ready".
disable-model-invocation: true
---

Read the plan and decide whether it is safe to implement. This skill **finds problems**; it does not fix them and it does not write code.

## Input
`/plan-validate <slug>` → resolve `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`. If it does not exist, abort: *"No plan at <path>. Run /plan <ticket> first."*

## Checks
Read the plan and the ticket it points to, then scan for issues in these categories:

| ID prefix | Category | The problem it catches |
|---|---|---|
| `IC-N` | Inconsistency | Two SIs (or an SI and the ticket/ADR/guidelines) contradict each other |
| `AMB-N` | Ambiguity | An SI's actions or acceptance criteria are too vague to implement or verify |
| `DG-N` | Dependency gap | An SI depends on something no earlier SI produces; or the Dependency Map has a cycle |
| `UT-N` | Untestable | An acceptance criterion no SI's Tests section makes observable, or an SI with real behavior and no seam |
| `CV-N` | Coverage | A ticket acceptance criterion no SI owns |
| `DL-N` | Deliverables | Deliverables missing the repo's real test / type-check / build commands |

## Output
Write `.scratch/<feature-slug>/plans/<NN>-<slug>/validation.md`:

```markdown
---
kind: validation
slug: <NN>-<slug>
status: clean | dirty
open_issues: <count of open issues>
---

# Validation — <NN> <Ticket title>

## Findings
### <ID> — <one-line headline>
- **Where:** <SI id or section>
- **Why it blocks:** <one or two sentences>
- **Suggested resolution:** <the smallest change that would clear it>

## Resolved
<issues cleared on a re-run, moved here with their ID>
```

`status: clean` only when every finding is resolved — no open issues. Otherwise `status: dirty`.

## Gate
- **dirty** → tell the user exactly what to fix: *"validation.md has N open issues. Revise the plan (edit it or re-run /plan <slug>), then re-run /plan-validate <slug>."* Never auto-fix; never partially proceed.
- **clean** → *"Plan is clean. Run /implement <slug> to build it SI by SI."*

`implement` reads this verdict and refuses to start on a `dirty` (or missing) validation. That refusal is the whole point of this stage.
