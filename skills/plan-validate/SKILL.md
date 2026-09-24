---
name: plan-validate
description: Validate an implementation plan before coding — check the SIs against the ticket, the node map and the FDD for gaps, ambiguity, dependency cycles, oversized slices, and untestable acceptance criteria, and emit a clean/dirty verdict that gates /implement. Use after /plan, on "validate the plan / is this plan ready".
disable-model-invocation: true
---

Read the plan and decide whether it is safe to implement. This skill **finds problems**; it does not fix them and it does not write code.

## Input
`/plan-validate <slug>` → resolve `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`. If it does not exist, abort: *"No plan at <path>. Run /plan <ticket> first."*

## Sources
Read the plan, and everything it is accountable to:
- **the ticket** it points to — the acceptance criteria and exclusions;
- **the node map** at the `design:` path — the modules, interfaces and seams the plan is supposed to encode;
- **the FDD** the ticket names — the declared test seams and the public contracts;
- **the ADRs, the boundary contract and the guidelines** binding in the area.

## Checks

| ID prefix | Category | The problem it catches |
|---|---|---|
| `IC-N` | Inconsistency | Two SIs, or an SI and the ticket / node map / **FDD** / ADR / boundary contract / guidelines, contradict each other |
| `AMB-N` | Ambiguity | An SI's actions or acceptance criteria are too vague to implement or verify |
| `DG-N` | Dependency gap | An SI depends on something no earlier SI produces; or the Dependency Map has a cycle |
| `UT-N` | Untestable | An acceptance criterion no SI's Tests section makes observable, or an SI with real behavior and no seam |
| `CV-N` | Coverage | A ticket acceptance criterion no SI owns |
| `SZ-N` | Oversized SI | An SI that needs two Acts to describe, or spans two seams, or whose actions are a sequence of independent deliverables — it violates the single-act rule and will not fit one red-green-refactor cycle |
| `DM-N` | Design divergence | An SI that introduces a module the node map doesn't have, changes an interface the map declares, or attaches tests at a seam the map and FDD don't name |
| `GR-N` | Grounding | A node the map calls `new` with no recorded search — or with a search a grep contradicts, because the thing already exists |
| `DL-N` | Deliverables | Deliverables missing the repo's real test / type-check / build commands |

For a plan with `type: structural`, also check that no SI modifies an existing test and that no SI adds behavior — a structural plan that changes behavior is an `IC` against its own ticket type.

`CV` and `SZ` are the two the author cannot reliably catch alone: coverage because omission is invisible from inside, and size because the author who wrote the slice believes it is one thing. `DM` exists because the plan claims to encode the node map and nothing used to check that claim.

**`GR` is the only check in this suite that leaves the documents.** Every other category — here and in `/doc-validate` — compares one artifact against another, which means a wrong assumption made early passes every gate, because it is internally consistent all the way down. Run the map's searches yourself: take each node marked `new`, grep the terms it says it searched for, and see whether the repository agrees. A node that turns out to already exist is the highest-value finding this stage can produce, because everything below it was about to be built twice.

## Output
Write `.scratch/<feature-slug>/plans/<NN>-<slug>/validation.md`:

```markdown
---
kind: validation
slug: <NN>-<slug>
status: clean | dirty
open_issues: <count of open issues>
run: <1 on the first validation; +1 on every re-run>
fired: {<prefix>: <count>, ...}   # every id ever raised, open and resolved, by prefix — e.g. {IC: 2, SZ: 1}
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

**Every id uses a prefix from the Checks table** — never a generic numbering (`PV-1`, `F-3`). The prefix is the finding's category, and `fired` is the per-project record of which mistakes this flow actually catches; a finding with no category is invisible to it. `fired` is cumulative: a re-run adds its new ids and never drops resolved ones.

## Gate
- **dirty** → tell the user exactly what to fix: *"validation.md has N open issues. Revise the plan (edit it or re-run /plan <slug>), then re-run /plan-validate <slug>."* Never auto-fix; never partially proceed.
- **clean** → *"Plan is clean. Run /implement <slug> to build it SI by SI."*

`implement` reads this verdict and refuses to start on a `dirty` (or missing) validation. That refusal is the whole point of this stage.
