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

## Measurements (required)
> Numbers only, and only from frontmatter: the ticket's `Gear` and acceptance criteria, `plan.md`'s
> `sis_planned` and `revision`, `progress.md`'s `sis_done` and `escalations`, `validation.md`'s `run`
> and `fired`, the review's `findings`, `by_severity` and `by_lens`, and per feature `tickets-validation.md`'s `tickets`, `seams` and `dispersion`. Nothing here is estimated. A ticket
> whose artifacts lack these fields predates them: list it as `not measured — pre-v0.4 frontmatter`
> rather than reconstructing its numbers from prose.
>
> This section is the series. Keep its shape identical between retros, so the next one can put its
> numbers beside this one's.

| Ticket | Gear | ACs | SIs planned | SIs done | Plan revisions | Validation runs | Escalations | Review findings |
|---|---|---|---|---|---|---|---|---|

**Totals by gear:** <per gear: tickets, median ACs, median SIs, SIs per AC, median review findings>

**Ticket sets:** <per feature: tickets, seams, dispersion, and the categories `tickets-validate` fired>

**Review findings by lens:** <summed `by_lens` across the scope>

**Compared with the previous retro:** <the same totals from the latest earlier `docs/retro/*.md`, side
by side — or `first measured retro` when none has a Measurements section>

## What shipped against what was planned (required)
> Where the Measurements table shows planned and done differ, what the artifacts say about why. A
> difference is not a failure; an *unexplained* difference is the finding.

| Ticket | Divergence, and what shows it |
|---|---|

## Where the gates earned their keep (required)
> Which `plan-validate` categories fired — summed from each `validation.md`'s `fired` — and how many
> runs it took to reach `clean`. A category that never fires across many cycles is either a problem
> this project doesn't have or a check that isn't working — say which you can tell from the
> artifacts, and which you can't.

| Category | Times fired | Example |
|---|---|---|

## Where the loop struggled (required)
> Escalations recorded in `progress.md`: SIs that hit the 3-attempt fix limit, failures that landed in
> an earlier SI's code, deliverables that failed at final verification. These are recorded facts, not
> impressions.

## Review findings, by lens (optional)
> Beyond the counts in Measurements: whether any class of finding repeats across tickets. A repeating finding is a standard that should move into a stack guide or a
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
