---
name: retro
description: Look back over a finished epic, feature or cycle by reading what the work left on disk (plans, validations, progress notes, review findings) and record what it taught about the process and about the product. Use after a set of tickets completes, at the end of a cycle, or on "retro / look back / what did we learn".
disable-model-invocation: true
---

Every stage in this flow writes forward. Nothing writes back: the documents freeze at approval, and what the work taught lives in progress notes nobody reopens and in a conversation that is gone after `/compact`. This stage closes that loop: once, over a finished chunk, from the artifacts.

## Input
`/retro <epic | feature | cycle>`: a set of **completed** tickets. Resolve them to their `.scratch/<feature-slug>/` directories.

If nothing in scope has a `progress.md` with `status: completed` (or, in one that predates the frontmatter, `**Status:** completed` in the body), abort: *"Nothing finished in `<scope>` yet. A retro over unfinished work reads the plan, not the outcome."*

## The one rule
**Every claim cites the artifact it came from.** You are reading files, not remembering a project. This is the difference between a retro that is worth writing down and one that manufactures plausible observations, and the second kind is worse than none, because it reads as verified.

Concretely: you may not write that something was hard, that a decision was debated, that the team struggled, or that an estimate was optimistic. None of that is on disk. What *is* on disk is a fix loop that hit three attempts, a validation that took four rounds to go clean, a deliverable that failed. Write those, and put the rest under *What the artifacts couldn't tell me*.

## What to read
| Artifact | What it tells you |
|---|---|
| `.scratch/<slug>/issues/<NN>-*.md` | what was asked for: acceptance criteria, exclusions, the declared type |
| `.scratch/<slug>/design/<NN>-*.md` | the node map, the interfaces intended |
| `plans/<NN>-*/plan.md` | how it was sliced, and the deliverable commands |
| `plans/<NN>-*/validation.md` | **the gate's history**: the `## Resolved` section keeps every issue cleared on a re-run, with its id |
| `plans/<NN>-*/progress.md` | what actually happened per SI: test results, escalations, out-of-scope notes |
| `.scratch/<slug>/reviews/<NN>-*.md` | the findings each lens produced |
| `.scratch/<slug>/request-trace.md` | what the owner asked, part by part, and which parts were dropped or deferred, and by whose decision |
| `.scratch/<slug>/acceptance/<NN>-*.md` | what was checked in the running software, what only by tests, what not at all |
| `git log` over the ticket's range | the shape of what landed |

`validation.md`'s `Resolved` section is the most underused file in the suite: it is a per-ticket record of which category of mistake this project actually makes. Read it across the whole scope before writing anything.

## Measure from frontmatter, never from prose
The counts come from fields each stage writes for exactly this purpose: the ticket's `Gear`, `plan.md`'s `sis_planned` and `revision`, `progress.md`'s `sis_done`/`sis_total`, `escalations` and `unverified`, `validation.md`'s `run` and `fired`, the review's `findings`, `by_severity`, `by_lens`, `verdicts` and `refuted_by_lens`, and per feature `tickets-validation.md`'s `tickets`, `seams`, `dispersion` and `fired`, each `trim/*.md`'s `before`, `after`, `proposed`, `applied`, `reverted` and `unrequested`, each `tidy/*.md`'s `proposed`, `applied`, `reverted` and `review_findings`, each `walkthrough/*.md`'s `questions`, `missed` and `unclear_after`, each `acceptance/*.md`'s `items`, `by_verdict`, `failed` and `mocked`, and each `diagnoses/*.md`'s `status`, `hypotheses`, `probes` and `levels`. Sum them; do not re-derive them from the body. A ticket whose artifacts lack the fields predates them; report it as not measured instead of reading a count out of a sentence, because a number reconstructed from prose looks exactly like a measured one and is not.

**Group the measurements by `plugin_version`**, the field every measured artifact records. Work done on two versions of the plugin is two populations: summing them hides exactly the change a new version was meant to make. An artifact without the field predates it; group it as `unknown`.

Then read the **Measurements** section of the most recent earlier `docs/retro/*.md` and put its totals beside this one's, version by version. One retro is a snapshot; the comparison, on the same version or across versions, is what shows whether a change to the flow did anything.

## Two outputs, two subjects
Sort every finding by **what it is about**, and never mix them:

**About the process** → `docs/retro/<scope>.md`, filling `${CLAUDE_PLUGIN_ROOT}/templates/retro.md`. Slices planned versus done, which gate categories fired, where the loop escalated, findings that repeat across tickets, and what should change, each naming the file it would change. **Tag every process finding** by whose file it would change:
- **`flow`**: the plugin's own process would do this wrong on any project (a stage's instructions, a gate, a template, an agent). It is an improvement to the plugin, and `/flow-report` gathers these across projects.
- **`project`**: specific to this repository (its stack guide, its guidelines, a rule or a check here).

When unsure, it is `project`: a flow change affects every user of the plugin, so it needs the stronger case, the same rule `/session-analyze` uses.

**About the product** → append to `docs/evolutions.md`, filling `${CLAUDE_PLUGIN_ROOT}/templates/evolutions.md`. This is where the out-of-scope notes accumulated in every `progress.md` finally land instead of being reported into a chat window. Each entry cites the progress file it came from.

A finding that is really a **defect** is neither: it belongs in a ticket. Say so and let the user decide, rather than filing a bug as a reflection.

## What repetition means
One occurrence is an incident. The same finding across several tickets is a **standard that should move**: a review finding that keeps recurring belongs in a stack guide or a rule; a validation category that keeps firing belongs earlier in the flow, in the stage that produces what it catches. Only call something a pattern when you can point at more than one instance, and name them.

Before proposing that a pattern move into a stack guide, a rule, a check or a skill, run it through `promotion-filter.md`: it must not be findable in five minutes, must be specific to this codebase, and must have cost real effort. One that fails stays in the retro as a finding, with the question it failed; it is not proposed as a guide.

## Debt the reviews saw and nobody owned
A review finding with the verdict `pre-existing` is real, but in code the diff did not change, so it is nobody's work and it vanishes after the review. Across an epic, those are the most honest map of technical debt the project has: found by the lenses, confirmed by the verifier, and located to `file:line`.

1. **Collect** every `pre-existing` finding in the scope's review files.
2. **Group them by area**: the component that owns the path (`docs/components.md`), or the directory when there is no component map.
3. **An area is a hotspot** when its findings come from **two or more tickets**. The repetition rule applies here as everywhere: one ticket's `pre-existing` finding is an incident. Where `docs/analysis/components/<c>.md` lists debt for the same area, cite it as corroboration. Where `docs/declined.md` has a `declined` entry covering the area, list the hotspot with that entry instead of proposing it, unless the entry's **Revisit when** has happened; then propose it and cite the entry.
4. **Propose at most 3 structural tickets**, ranked by **benefit against cost**. Benefit is the severity of the findings times the number of tickets that ran into them; cost is how much the fix touches (files, and whether the use is encapsulated or spread). Each proposal cites the findings it would close (review file and finding) and says why it is structural. The rest of the hotspots are listed, not proposed.

Nothing is created here. The owner decides; a chosen proposal becomes a `Type: structural` ticket whose Source is this retro (`retro: docs/retro/<scope>.md`).

## The environment, as far as the artifacts show it
The environment lens belongs to `/session-analyze`, which reads the conversation where navigation, tool economy and missing information show up. Here, take only the part the artifacts and the repository prove, through `environment.md`:
- **The guardrail**: `docs/guardrails.md`, or the repository's hooks and CI. None is a finding.
- **Mechanical standards the review kept catching**: a repeated review finding a linter, a hook or a CI job could catch becomes a proposed check, not a rule.
- **What the sessions found**: the `Environment` sections of the `docs/meta-retro/` reports in scope, cited, not re-derived. With no meta-retro in scope, say that the session side of the environment was not read.

## This is a log, not a state file
`/flow` derives state from artifacts and refuses documents that must be maintained. These two outputs do not compete with that: they are **append-only history**, nothing derives current state from them, and a stale entry is still a true record of what was observed then. Never edit or remove an earlier entry; if something changed, add an entry that says so.

## The boundaries of this stage
- **It reads and records.** Every change it recommends names the stage that owns the file, and that stage makes it.
- **It describes the work.** The artifacts record what was done, not how well anyone did it; findings are about steps, gates and files.
- **A wrong decomposition is recorded**, here and in `evolutions.md`; `/decompose` amends `features.md` on its next run.
- **What happened is stated; why, only when written down.** That a slice shipped differently than planned is a fact on disk; its reason is quoted from where it was written, or named as not written down.

## Workflow
1. Resolve the scope to its completed tickets; abort if none finished.
2. Read the artifacts above across the whole scope, `validation.md`'s `Resolved` sections included.
3. Fill **Measurements** from frontmatter, per ticket, by gear and by `plugin_version`, and compare with the previous retro's.
4. Explain the planned-versus-done divergences and the gate categories that fired, citing the files.
5. Collect escalations, failed deliverables, and repeated review findings, with their instances.
6. Group the `pre-existing` findings by area; name the hotspots; propose at most 3 structural tickets.
7. Take the environment as far as the artifacts show it: the guardrail, the mechanical standards the review kept catching, and the meta-retros' Environment sections.
8. Sort every finding: process (tagged `flow` or `project`), product, or defect.
9. Write `docs/retro/<scope>.md`; append the product findings to `docs/evolutions.md`.
10. Self-review: every claim points at a file, nothing describes how the work felt, and the gaps are named.
