<!--
TEMPLATE: retro (what a finished slice of work taught about the PROCESS)
Filled by /retro over a completed epic, feature or cycle. Its subject is the flow, not the product —
product findings go to docs/evolutions.md.

EVERY CLAIM CITES AN ARTIFACT. This document is written by reading plan.md, validation.md,
progress.md and the review files — not by recalling how the work felt. A sentence that sounds like a
measurement and isn't is worse than no sentence, because it reads as verified.
Where the artifacts cannot answer something, say so under "What the artifacts couldn't tell me".
PRUNE optional sections that don't apply; (required) sections always stay.
-->

# Retro — <epic / feature / cycle>

## Metadata (required)
- **Scope:** <what this covers — the tickets, by id>
- **Date:** <YYYY-MM-DD>
- **Read from:** <the artifact paths this was built out of>

## What shipped against what was planned (required)
> Per ticket: the slices planned, the slices done, and — where they differ — what the artifacts say
> about why. A difference is not a failure; an *unexplained* difference is the finding.

| Ticket | SIs planned | SIs done | Divergence, and what shows it |
|---|---|---|---|

## Where the gates earned their keep (required)
> Which `plan-validate` categories actually fired, and how many rounds it took to reach `clean`.
> The `## Resolved` section of each `validation.md` keeps that history. A category that never fires
> across many cycles is either a problem this project doesn't have or a check that isn't working —
> say which you can tell from the artifacts, and which you can't.

| Category | Times fired | Example |
|---|---|---|

## Where the loop struggled (required)
> Escalations recorded in `progress.md`: SIs that hit the 3-attempt fix limit, failures that landed in
> an earlier SI's code, deliverables that failed at final verification. These are recorded facts, not
> impressions.

## Review findings, by lens (optional)
> From the persisted review files: which lenses produced findings, and whether any class of finding
> repeats across tickets. A repeating finding is a standard that should move into a stack guide or a
> rule — the repetition is the signal, and one occurrence is not.

## What to change in the process (required)
> The actionable part. Each item names the artifact that motivates it and the file it would change —
> a stack guide, a template, a stage's instructions. An item with no source is an opinion; put it in
> Open questions instead.

| Change | Motivated by | Where it lands |
|---|---|---|

## What the artifacts couldn't tell me (required)
> The honest boundary. Anything a reader might expect this document to cover that the files on disk
> do not record — time spent, why a decision was made in conversation, whether the work felt hard.
> Naming the gap is what keeps the rest of the document trustworthy.

## Open questions (optional)
