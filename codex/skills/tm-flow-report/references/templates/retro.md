<!--
TEMPLATE: retro (what a finished slice of work taught about the PROCESS)
Filled by $thasmorato-skills:tm-retro over a completed epic, feature or cycle. Its subject is the flow, not the product;
product findings go to docs/evolutions.md.

EVERY CLAIM CITES AN ARTIFACT. This document is written by reading plan.md, validation.md,
progress.md and the review files, not by recalling how the work felt. A sentence that sounds like a
measurement and isn't is worse than no sentence, because it reads as verified.
Where the artifacts cannot answer something, say so under "What the artifacts couldn't tell me".
PRUNE optional sections that don't apply; (required) sections always stay.
The written file STARTS with the frontmatter below; this comment is not copied.
-->

---
kind: retro
scope: <epic / feature / cycle>
date: <YYYY-MM-DD>
plugin_versions: [<as the measuring script prints it>]
features: [<as the measuring script prints it: the features this retro read>]
tickets: [<as the measuring script prints it: the finished tickets this retro covered, `<feature>/<NN-slug>`>]
findings: {flow: <n>, repo-skill: <n>, repo-code: <n>, product: <n>}
---

# Retro: <epic / feature / cycle>

## Metadata (required)
- **Scope:** <what this covers: the tickets, by id, and the tickets in scope left out as not finished>
- **Date:** <YYYY-MM-DD>
- **Read from:** <the artifact paths this was built out of>

## Measurements (required)
> The section `node "references/scripts/retro-measure.mjs" <scope>` prints, pasted whole and
> unchanged: every number in it is a frontmatter field the script summed, and its shape is the same in
> every retro, so the next one can set its numbers beside these. `not measured` stays as printed.

<the script's section>

**Compared with the previous retro:** <the totals of the retro the script names, beside these, version by
version; or `first measured retro`>

## What shipped against what was planned (required)
> Where the Measurements table shows planned and done differ, what the artifacts say about why. A
> difference is not a failure; an *unexplained* difference is the finding.

| Ticket | Divergence, and what shows it |
|---|---|

## Where the gates earned their keep (required)
> Which `plan-validate` categories fired (summed from each `validation.md`'s `fired`) and how many
> runs it took to reach `clean`. A category that never fires across many cycles is either a problem
> this project doesn't have or a check that isn't working; say which you can tell from the
> artifacts, and which you can't.

| Category | Times fired | Example |
|---|---|---|

## Where the loop struggled (required)
> Escalations recorded in `progress.md`: SIs that hit the 3-attempt fix limit, failures that landed in
> an earlier SI's code, deliverables that failed at final verification. These are recorded facts, not
> impressions.

## Review findings, by lens (optional)
> Beyond the counts in Measurements: whether any class of finding repeats across tickets. A repeating finding is a standard that should move into a stack guide or a
> rule or a check: the repetition is the signal, and one occurrence is not. A mechanical one is proposed as a check; a judgement
> one first passes the promotion filter (`skills/retro/promotion-filter.md`), and one that fails stays here as a finding, with
> the question it failed.

## Debt hotspots (required when any review had a `pre-existing` finding)
> From the `pre-existing` verdicts across the scope's reviews: real problems in code no ticket changed.
> An area is a hotspot when two or more tickets ran into it. At most 3 are proposed as structural tickets,
> ranked by benefit (severity × tickets that hit it) against cost (what the fix touches); the rest are
> listed. Nothing here is a ticket until the owner picks it.

| Area | Findings (review · finding) | Tickets that hit it | Proposed structural ticket | Benefit / cost |
|---|---|---|---|---|

## The environment (required)
> Every category `skills/retro/environment.md` marks as read by `$thasmorato-skills:tm-retro`, each with its evidence cited or
> `none in scope`; the session side belongs to `$thasmorato-skills:tm-session-analyze`. A mechanical standard is proposed as a
> check, a judgement one as a line the review reads.

**Guardrail:** <`docs/guardrails.md`, or the repo's pre-commit hook and CI job and which of lint / type check / tests each runs; or `none`, which is itself a finding>

**Automated checks:** <mistakes a linter, the type checker, a test or a CI job could have caught: repeated review findings, failed deliverables, escalations, each with the check that would catch it>

**Navigation:** <effort spent finding a file or a convention: `progress.md` notes, review findings of the "missed the existing X" kind, analogues `pattern-scout` found late, each with the pointer that would have sent the agent there>

**Coding standards:** <a rule the review enforces that is unclear, stale or never fires: the lenses the Measurements show with low precision, and what their refuted findings have in common>

**Information access:** <facts out of reach: `unverified` items, `> Assumed:` marks, `Not verified` sections, escalations that ended in "could not observe", each with the access that would close it>

**From the sessions:** <the Environment sections of the `docs/meta-retro/` reports in scope, cited; or `no meta-retro in scope: the session side was not read`>

## What to change in the process (required)
> The actionable part. Each item names the artifact that motivates it and the file it would change:
> a stack guide, a template, a stage's instructions. An item with no source is an opinion; put it in
> Open questions instead.

> Give each change its level (`skills/retro/levels.md`): `flow` (the plugin's own stages, gates, templates or
> agents would do this wrong on any project; `$thasmorato-skills:tm-flow-report` gathers these, and nothing here applies them),
> `repo-skill` (this repo's skills, guides, rules or `CLAUDE.md`) or `repo-code` (this repo's code or
> configuration; a defect in what shipped is one, and lands in a ticket). When unsure, the lowest level
> that resolves it.

| Change | Level | Motivated by | Where it lands |
|---|---|---|---|

## What the artifacts couldn't tell me (required)
> The honest boundary. Anything a reader might expect this document to cover that the files on disk
> do not record: time spent, why a decision was made in conversation, whether the work felt hard.
> Naming the gap is what keeps the rest of the document trustworthy.

## Open questions (optional)
