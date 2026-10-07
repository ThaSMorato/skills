---
description: Break an FDD into tracer-bullet tickets with blocking edges, then publish them (local files or a real tracker).
argument-hint: "<feature name or slug> (or a path/issue reference)"
---

Break the feature's design into a set of **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it. This is interactive: quiz the user before publishing anything.

> Call the Skill tool with `asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

A ticket may be executed by an agent **or picked up by the owner**, so it carries the why and the constraints, not only the instruction. `${CLAUDE_PLUGIN_ROOT}/templates/ticket.md` is the contract.

## 1. Gather context
Read `docs/fdd/<feature>.md` for: $ARGUMENTS (or the reference passed as an argument). Also read `docs/boundaries.md` (the components this feature may touch and the edges it may add), the relevant `docs/adr/*.md`, and `CONTEXT.md`. If no FDD exists, tell the user to run `/fdd` first.

Read `docs/guidelines.md` too, if it exists, and load what its routing table names for the code this feature will touch: the stack guides and `testing-guide-<project>`. Every ticket declares a `Test seam`, and what a seam can be (a request spec, a component test, a service object's public method) is decided by the stack and by this project's testing guide, not by the FDD alone.

Read this feature's row in `docs/features.md` too, if it exists. You can only see **one** feature's FDD, so its **`Depends on`** column is the only place a cross-feature blocker is written down: a ticket here that needs something another feature delivers must say so, even though that blocker lives outside the graph you are about to build. Its **`Not delivering`** bound feeds the tickets' exclusions.

## 2. Explore the codebase
**Required whenever code exists**; optional only on an empty repository. A ticket written without looking asks for things that are already built, and every stage below it elaborates that request instead of questioning it.

For each capability the FDD describes, grep the domain nouns and the likely symbol names before writing a ticket that says "build". Then say, per ticket, **what already exists that it can reuse**, and where the answer is "most of it", the ticket is a wiring job and should be written as one.

Look for **prefactoring** opportunities too: "make the change easy, then make the easy change."

## 3. Draft vertical slices
Each slice cuts a **narrow but complete** path through every layer (schema, API, UI, tests): vertical, never a horizontal slice of one layer. A completed slice is **demoable on its own**. Prefactoring goes first. Give each ticket its **blocking edges**.

**Size by the seam.** The FDD declares its test seams in a required section; **one ticket crosses one seam end to end**, and so **the number of tickets should be close to the number of seams.** Seven tickets over two seams means five are slicing *within* a seam, which is the plan's job one level down. The seam is observable at planning time, comparable between tickets, and already written down. "Fits one context window" is none of those, and the SI-based implement loop made it obsolete anyway: the unit that must fit a context is the SI, not the ticket. Where a feature has one seam for everything, prefer fewer, larger tickets: split only where a part can be demoed and verified alone.

**A ticket is not a test point.** Slices that share a layer or a screen go in one ticket; the AC list is where the test points live. When a sibling feature was already broken down, start from its grouping and say so.

**Size has a floor, not just a ceiling.** A ticket is too small when nothing observable changes through its seam ("add a test"), or when none of its ACs traces to an FDD criterion ("change a constant"). Either of those belongs inside another ticket's plan, as an SI or as a step of one.

**Size relatively.** After drafting, put the tickets side by side and compare them to each other, not to an absolute limit. Comparison is far more reliable than estimation, for a model and for a person, and dispersion is what actually goes wrong here.

**Follow-ups stay out of the set.** Work the drafting finds outside the request (a placeholder for later, an improvement next door) goes to `.scratch/<feature-slug>/follow-ups.md`, one line each with why, unnumbered and outside `issues/`. The set holds only what was asked; the gate names the follow-ups separately.

**Mark the type.** A **structural** ticket (prefactoring, expand/migrate/contract) changes shape and not behavior: existing tests stay unchanged and stay green, and that is verifiable at review. A **behavioral** ticket changes what the system does.

**Wide-refactor exception:** a single mechanical change whose blast radius breaks thousands of call sites can't land green as a vertical slice. Sequence it **expand → migrate (batches, each blocked by expand) → contract (blocked by every batch)**, all structural; if batches can't stay green alone, share an integration branch that all block a final integrate-and-verify ticket. The **contract** ticket, the one that removes the old shape, carries an acceptance criterion of **zero remaining consumers**, with the evidence named: no calls in the logs over an agreed window, no import in any consumer, no failing consumer contract test. Removing on the belief that nobody uses it is how a published contract breaks.

## 4. Write the set, then validate it
Write **local files** first, always, even when the tickets will end up in a tracker: one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order, each filling `${CLAUDE_PLUGIN_ROOT}/templates/ticket.md`. Number the acceptance criteria `AC-1`, `AC-2`. `/plan` maps each to an SI and `/plan-validate` checks the coverage by id, which it cannot do against unlabelled bullets.

Write `.scratch/<feature-slug>/request-trace.md` beside them: one row per part of the owner's request (their message, `task.md`, the brief, an image or document they supplied), quoted, with the ticket and AC that cover it:

```markdown
| # | Part of the request (quoted) | From | Covered by | Status |
|---|---|---|---|---|
| 1 | "<the owner's words>" | task.md | 02 · AC-3 | covered |
| 2 | "<the owner's words>" | message | none | deferred: > Decided: <why> — owner, <date> |
```

A part is `covered`, or `excluded`/`deferred` only with the owner's `> Decided:`. An AC that goes wider than the part it covers, or a part dropped, rewritten or deferred, is raised at the gate, never settled in the draft. Copy the owner supplied (text in an image, a document) enters the ticket as `> Decided:` with its source, never as `> Assumed:`.

Then call the Skill tool with `tickets-validate` over the set. This is the postflight, and it is not optional: it checks coverage against the FDD, invention, tickets too big or too small, several tickets on one seam, blocking cycles and dispersion, and writes `.scratch/<feature-slug>/tickets-validation.md`. If it comes back `dirty`, fix the set and re-run it **before** showing the user anything. A set the user sees should already have a verdict, so their attention goes to judgment, not to catching a cycle.

## 5. Quiz the user
Present the breakdown as a numbered list (per ticket: **Title**, **Type**, **Seam**, **Blocked by**, **What it delivers**, **estimated SIs**), headed by the verdict, the **tickets-to-seams count**, the number of tickets in words, and any request part not `covered`. The follow-ups are listed after, as their own question. Ask (merges and splits as a multi-select):
1. Is the granularity right?
2. **Are these comparable to each other?** Show the sizes side by side. This is the question that catches dispersion; asking only about the set as a whole never does.
3. Are the blocking edges genuine gates?
4. Should any be merged or split?

Every change edits the files and re-runs the validation. Iterate until the user approves a `clean` set.

## 6. Publish (blockers first)
The local files are the default and are already written. If the user asks for a real tracker (GitHub, etc.) and a remote exists, publish one issue per ticket in dependency order using native blocking links. Never close or modify a parent issue.

Avoid file paths and code snippets: they go stale; the exception is a decision-encoding snippet from a prototype, trimmed to the decision.

`Gear` is the gear `/flow` confirmed for this feature (`full` or `feature`, since this command needs an FDD), or `full` when this runs standalone.

`Status` starts `ready` for unblocked tickets and `blocked` for the rest. It records **readiness, not who executes**: the old `ready-for-agent` presumed the executor, and the owner picking the ticket up made the field a lie.

Work the **frontier**: any ticket whose blockers are all done: `/design` → `/plan` → `/plan-validate` → `/implement` → `/review`.
