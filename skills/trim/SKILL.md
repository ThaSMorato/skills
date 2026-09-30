---
name: trim
description: 'After a ticket is implemented and before it is reviewed, make its change smaller without changing behavior — read every file the diff created or modified against the plan and the acceptance criteria, and propose structural cuts with evidence: incidental hunks nothing asked for, code that re-implements what the repo already has, new files or layers the change did not need, a behavior spread over more files than it needs. Applies only the cuts the user picks, one at a time, with the tests untouched and green. Use after /implement and before /review, on "trim / shrink / make this diff smaller / more targeted".'
disable-model-invocation: true
---

`/implement` made the ticket work. Before anyone reviews it, this stage asks: **did the change need to be this big?** A diff that works often carries more than the ticket needed: a drive-by rename, a helper the repo already had, a new file where an edit would do, one behavior threaded through five files. The unit here is the **delta against the fixed point**, not the resulting code, and the goal is fewer and smaller files touched **with the behavior identical**.

It runs before `/review` so the review reads the smaller diff and spends no lens on code that was about to go. `/tidy` still runs after the review, and shapes what is left by the rules of Simple Design.

## Scope and sources
- **The diff:** `git diff <fixed-point>...HEAD`, with `--name-status` for the files created and modified. Use the fixed point `/review` will use next: where the ticket's branch started.
- **The trace:** the ticket's acceptance criteria and the plan's SIs, each with the AC it serves. They decide which hunks the ticket asked for. When there is no plan, the ticket's ACs alone are the trace. When there is neither, stop: without a trace, "incidental" is an opinion.
- **The repository outside the diff** is read, never edited: that is where the reuse criterion looks.

## Behavior does not change
Every cut is **structural**: the behavior after it is identical, and **existing tests are not modified**. That is the contract of this stage, and the tests are how it is checked. The four things that break "pure" refactors most often (order, errors and side effects, observability, type breadth) are listed in the `tidy` skill's Propose step; check them for every cut.

It may rewrite code in the diff to make it smaller (fold a new file into one the ticket already touches, inline a layer, call an existing primitive), but it **never adds an abstraction**: every applied cut leaves the diff smaller than it found it.

What it finds but cannot cut, it reports. A behavior no AC asked for (a parameter nobody passes, an option, an endpoint or a field no AC needs, a branch for a state the code cannot reach) is **scope**, and removing it changes behavior. List it as an **unrequested behavior** note, with the evidence; `/review` hands the notes to its spec lens, which judges the diff against the plan and the ticket, all of it and only it.

## The four criteria, in order
Each criterion shrinks what the next one has to look at, so walk them in this order.

1. **Trace — every hunk answers to an SI or an AC.** An *incidental* hunk answers to none and changes no behavior: a reformat, a drive-by rename, a refactor of neighboring code, an import reshuffle. The cut reverts it to its fixed-point version. (A hunk that answers to none but does change behavior is an unrequested-behavior note, above.)
2. **Reuse — new code that re-implements something the repo already has.** Start from the node map's **Analogues** and **Conventions to mirror** (from `pattern-scout`), then search the codebase for the primitive (same name family, same signature, the stack guide's list of shared utilities) and cite it at `file:line`. The substitute must honor the same contract, including the edge cases the ticket's tests exercise; a primitive that almost fits is not a substitute.
3. **Footprint — structure the change did not need.** A new file whose content fits in an existing one the ticket already touches; an interface or layer with a single implementation and no seam a test or a boundary requires; a file touched only to pass something through.
4. **Locality — one behavior spread over more files than it needs.** The *Shotgun Surgery* smell (`code-smells` skill), measured on this diff: which files each behavior touches now, and the smaller set that would hold it.

## 1. Propose
Measure the diff first (files created, files modified, lines added and removed), then walk the criteria. Each proposal carries:
- **the criterion**;
- **the evidence**: `file:line` of the hunk; for trace, which SIs and ACs were checked and why none covers it; for reuse, the existing primitive's `file:line` and why its contract matches;
- **the cut**, and what the diff loses: files, lines;
- **why it is structural**: behavior identical, no test changes.

A proposal without evidence, one that changes behavior, or one that grows the diff, is not a trim. Drop it (a behavior change becomes a note).

Present the proposals grouped by criterion, in order, as a structured choice. **The user picks which to apply.** None is applied by default.

## 2. Apply, one at a time
For each chosen cut, in criterion order:
1. Make the cut.
2. Run the ticket's tests, and the suite the plan's Deliverables name.
3. **Existing tests are not modified.** If a test has to change for the cut to pass, the cut was not structural: revert it, report it, and move on. Do not rewrite the test to fit.
4. Green → next cut. Red → revert this one and report it; never stack a second cut on a red suite.

Put the cuts in their own commit, apart from the behavioral work, so it can be reviewed and reverted on its own. Version control remains the user's call; say which commit you suggest.

## Output
Write `.scratch/<feature-slug>/trim/<NN>-<slug>.md`:

```markdown
---
kind: trim
slug: <NN>-<slug>
fixed_point: <ref>
before: {files_created: <n>, files_modified: <n>, added: <n>, removed: <n>}
after: {files_created: <n>, files_modified: <n>, added: <n>, removed: <n>}
proposed: {trace: <n>, reuse: <n>, footprint: <n>, locality: <n>}
applied: <n>
reverted: <n — cuts that needed a test change or turned the suite red>
unrequested: <n — behavior notes handed to the review>
---
```

Then each proposal with its criterion, evidence and outcome (`applied`, `declined`, `reverted` and why), and an **Unrequested behavior** section with every note. `/retro` reads the frontmatter: `before` against `after` is what trimming saved, and many trace proposals or unrequested notes point at where scope creeps in upstream, at `/plan` or `/implement`.

Then hand off to `/review` with the same fixed point.
