---
name: tickets-validate
description: Validate a feature's set of tickets before the human gate — coverage against the FDD, tickets that trace to nothing, tickets too big or too small, several tickets slicing one seam, blocking cycles, and sizes that are not comparable — and emit a clean/dirty verdict. Runs as the postflight of /tickets, or on "validate the tickets".
disable-model-invocation: true
---

Read one feature's tickets **as a set** and decide whether they are sliced right. This skill finds problems; it does not rewrite tickets.

It exists because the ticket set was the one artifact in the flow with no validator. `doc-validate` stops at the FDD and `plan-validate` starts at one ticket; between them, the slicing was checked only by asking the user whether it looked right. And every size rule was a ceiling. "Write a test" and "change a constant" fit under any ceiling, so a set could be split into seven tickets that were each far too small and still pass. It could also be cut into five tickets that were each far too big, pass the side-by-side comparison, and drift as a whole because they were comparable to each other.

## Input
`/tickets-validate <feature>` → the tickets under `.scratch/<feature-slug>/issues/*.md`. If there are none, abort: *"No tickets for <feature>. Run /tickets <feature> first."*

## Sources
- **The tickets**, all of them, together.
- **The FDD** named in their `Source`: its acceptance criteria and its declared **test seams**.
- `docs/features.md`, this feature's row: the `Depends on` column holds the cross-feature blockers.

A ticket whose `Source` records a deliberate skip (`direct — <gear> gear, no FDD`) has no FDD to check coverage against. Skip `SC` for it, and run everything else, since its seam is in its own `Test seam` field.

## Checks

| ID prefix | Category | The problem it catches |
|---|---|---|
| `SC-N` | Seam / criterion coverage | An FDD acceptance criterion or declared test seam that no ticket owns |
| `IV-N` | Invention | A ticket, or a ticket AC, that traces to nothing in the FDD |
| `SZ-N` | Oversized ticket | A ticket that crosses two seams |
| `UZ-N` | Undersized ticket | A ticket with no behavior observable through its own seam, or with no AC that traces to the FDD |
| `SM-N` | Same seam | Two or more tickets on the same seam: they are slicing inside it, which is the job of SIs |
| `DG-N` | Dependency graph | A cycle in the `Blocked by` edges, a blocker that names no existing ticket, or a cross-feature blocker from `features.md` that no ticket carries |
| `DS-N` | Dispersion | The ticket with the most ACs has more than **3×** as many as the one with the fewest |
| `AS-N` | Unmarked assumption | A scope decision (an `Exclusion`, an in/out call) that the FDD does not give, with no `> Assumed:` marker, per the `asking` skill §6 |

## The anchor: tickets ≈ seams
**The number of tickets should be close to the number of distinct seams they cross.** Seven tickets over two seams means five of them are slicing *within* a seam, and that is the plan's job, one level down. This is a count, not a judgment, and it is the check that catches the over-split set that every ceiling lets through. Report the two numbers in the verdict even when they match.

`SM` and `DS` cover the two directions. `SM` catches a set cut too fine. `DS` catches a set that is out of scale with itself, including five huge tickets on five distinct seams, which `SM` alone would pass.

## The floor, stated as rejection tests
A ticket is too small (`UZ`) when **either** test fails:
1. **Observable behavior.** Through its declared seam, something a user or caller can see changes. "Add a test" fails this: the test is how a behavior is verified, not a behavior.
2. **Trace.** At least one of its ACs traces to an FDD acceptance criterion. "Change the timeout to 30s" fails this unless an FDD criterion asks for it.

**Structural tickets** (prefactoring, expand/migrate/contract) add no behavior by definition. For them the first test becomes: *existing tests stay green, and at least one behavioral ticket is blocked by this one*. A prefactoring ticket that nothing depends on is refactoring for its own sake. A wide-refactor's batches share a seam legitimately, so do not report them as `SM`.

## Calibration
`DS`'s 3× threshold is a starting value, not a law: record the ratio in every verdict so it can be recalibrated from real sets. A set with one ticket has no dispersion to measure.

## Output
Write `.scratch/<feature-slug>/tickets-validation.md`. It sits outside `issues/`, because every file there is read as a ticket.

```markdown
---
kind: tickets-validation
feature: <feature-slug>
status: clean | dirty
open_issues: <count of open issues>
run: <1 on the first validation; +1 on every re-run>
fired: {<prefix>: <count>, ...}   # every id ever raised, open and resolved, by prefix
tickets: <count>
seams: <count of distinct seams the tickets cross>
dispersion: <max ACs / min ACs, one decimal>
---

# Tickets validation — <feature>

## Findings
### <ID> — <one-line headline>
- **Where:** <ticket number and title>
- **Why it blocks:** <one or two sentences>
- **Suggested resolution:** <the smallest change that would clear it — usually a merge or a split, naming the tickets>

## Resolved
<issues cleared on a re-run, moved here with their ID>
```

Every id uses a prefix from the Checks table. `fired` is cumulative, as in `plan-validate`.

## Gate
- **dirty** → report the findings, merges and splits first, with each ticket resolved to its title. The fix goes back to `/tickets`. Never rewrite the tickets here.
- **clean** → hand back to `/tickets`' gate: the user approves the set.
