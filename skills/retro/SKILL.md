---
name: retro
description: Look back over a finished epic, feature or cycle by reading what the work left on disk — plans, validations, progress notes, review findings — and record what it taught about the process and about the product. Use after a set of tickets completes, at the end of a cycle, or on "retro / look back / what did we learn".
disable-model-invocation: true
---

Every stage in this flow writes forward. Nothing writes back: the documents freeze at approval, and what the work taught lives in progress notes nobody reopens and in a conversation that is gone after `/compact`. This stage closes that loop — once, over a finished chunk, from the artifacts.

## Input
`/retro <epic | feature | cycle>` — a set of **completed** tickets. Resolve them to their `.scratch/<feature-slug>/` directories.

If nothing in scope has a `progress.md` with `status: completed` (or, in one that predates the frontmatter, `**Status:** completed` in the body), abort: *"Nothing finished in `<scope>` yet. A retro over unfinished work reads the plan, not the outcome."*

## The one rule
**Every claim cites the artifact it came from.** You are reading files, not remembering a project. This is the difference between a retro that is worth writing down and one that manufactures plausible observations — and the second kind is worse than none, because it reads as verified.

Concretely: you may not write that something was hard, that a decision was debated, that the team struggled, or that an estimate was optimistic. None of that is on disk. What *is* on disk is a fix loop that hit three attempts, a validation that took four rounds to go clean, a deliverable that failed. Write those, and put the rest under *What the artifacts couldn't tell me*.

## What to read
| Artifact | What it tells you |
|---|---|
| `.scratch/<slug>/issues/<NN>-*.md` | what was asked for: acceptance criteria, exclusions, the declared type |
| `.scratch/<slug>/design/<NN>-*.md` | the node map — the interfaces intended |
| `plans/<NN>-*/plan.md` | how it was sliced, and the deliverable commands |
| `plans/<NN>-*/validation.md` | **the gate's history** — the `## Resolved` section keeps every issue cleared on a re-run, with its id |
| `plans/<NN>-*/progress.md` | what actually happened per SI: test results, escalations, out-of-scope notes |
| `.scratch/<slug>/reviews/<NN>-*.md` | the findings each lens produced |
| `git log` over the ticket's range | the shape of what landed |

`validation.md`'s `Resolved` section is the most underused file in the suite: it is a per-ticket record of which category of mistake this project actually makes. Read it across the whole scope before writing anything.

## Measure from frontmatter, never from prose
The counts come from fields each stage writes for exactly this purpose: the ticket's `Gear`, `plan.md`'s `sis_planned` and `revision`, `progress.md`'s `sis_done`/`sis_total` and `escalations`, `validation.md`'s `run` and `fired`, the review's `findings`, `by_severity` and `by_lens`. Sum them; do not re-derive them from the body. A ticket whose artifacts lack the fields predates them — report it as not measured instead of reading a count out of a sentence, because a number reconstructed from prose looks exactly like a measured one and is not.

Then read the **Measurements** section of the most recent earlier `docs/retro/*.md` and put its totals beside this one's. One retro is a snapshot; the comparison is what shows whether a change to the flow did anything.

## Two outputs, two subjects
Sort every finding by **what it is about**, and never mix them:

**About the process** → `docs/retro/<scope>.md`, filling `${CLAUDE_PLUGIN_ROOT}/templates/retro.md`. Slices planned versus done, which gate categories fired, where the loop escalated, findings that repeat across tickets, and what should change — each naming the file it would change.

**About the product** → append to `docs/evolutions.md`, filling `${CLAUDE_PLUGIN_ROOT}/templates/evolutions.md`. This is where the out-of-scope notes accumulated in every `progress.md` finally land instead of being reported into a chat window. Each entry cites the progress file it came from.

A finding that is really a **defect** is neither: it belongs in a ticket. Say so and let the user decide, rather than filing a bug as a reflection.

## What repetition means
One occurrence is an incident. The same finding across several tickets is a **standard that should move**: a review finding that keeps recurring belongs in a stack guide or a rule; a validation category that keeps firing belongs earlier in the flow, in the stage that produces what it catches. Only call something a pattern when you can point at more than one instance — and name them.

## This is a log, not a state file
`/flow` derives state from artifacts and refuses documents that must be maintained. These two outputs do not compete with that: they are **append-only history**, nothing derives current state from them, and a stale entry is still a true record of what was observed then. Never edit or remove an earlier entry; if something changed, add an entry that says so.

## Rules (negative)
- **Don't fix anything.** This stage reads and records. A change it recommends is made by the stage that owns the file.
- **Don't grade people.** The artifacts record work, not performance, and nothing on disk supports a claim about who.
- **Don't rewrite the decomposition.** If the work showed a feature was cut wrong, record it here and in `evolutions.md`; `/decompose` amends `features.md` on its own next run.
- **Don't infer intent from a diff.** That a slice shipped differently than planned says what happened, not why. Where the reason is not written down, say it is not written down.

## Workflow
1. Resolve the scope to its completed tickets; abort if none finished.
2. Read the artifacts above across the whole scope, `validation.md`'s `Resolved` sections included.
3. Fill **Measurements** from frontmatter, per ticket and by gear, and compare with the previous retro's.
4. Explain the planned-versus-done divergences and the gate categories that fired, citing the files.
5. Collect escalations, failed deliverables, and repeated review findings — with their instances.
6. Sort every finding: process, product, or defect.
7. Write `docs/retro/<scope>.md`; append the product findings to `docs/evolutions.md`.
8. Self-review: every claim points at a file, nothing describes how the work felt, and the gaps are named.
