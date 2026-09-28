---
name: trim
description: 'After a ticket is reviewed, make its change smaller — read every file the diff created or modified against the plan and the acceptance criteria, and propose cuts with evidence: hunks nothing asked for, code that re-implements what the repo already has, new files or layers the change did not need, a behavior spread over more files than it needs. Applies only the cuts the user picks, one at a time. Use after /review and before /tidy, on "trim / shrink / make this diff smaller / more targeted".'
disable-model-invocation: true
---

`/tidy` asks whether the code the ticket left is simple. This stage asks an earlier question: **did the change need to be this big?** A diff can pass every rule of Simple Design and still be twice what the ticket needed. It carries a drive-by rename, a parameter nobody passes, a helper the repo already had, a new file where an edit would do. The unit here is the **delta against the fixed point**, not the resulting code.

## Scope and sources
- **The diff:** `git diff <fixed-point>...HEAD`, the same fixed point `/review` used, with `--name-status` for the files created and modified.
- **The trace:** the ticket's acceptance criteria and the plan's SIs, each with the AC it serves. These decide what was asked for. When there is no plan (the Small gear still has one; a hand-made change may not), the ticket's ACs alone are the trace. When there is neither, stop: without a trace, "unrequested" is an opinion.
- **The review file:** read it so no cut undoes a fix a finding asked for, and so a cut that removes code a finding points at says so.
- **The repository outside the diff** is read, never edited: that is where the reuse criterion looks.

This stage runs **after** the review, so it must not add code nobody reviewed. It only **subtracts** (cut a hunk, revert an incidental change to its fixed-point version) or **substitutes with code that already exists** (call the repo's primitive instead of the new copy). It never introduces an abstraction; shaping what remains is `/tidy`'s job.

## The four criteria, in order
Each criterion shrinks what the next one has to look at, so walk them in this order.

1. **Trace — every hunk answers to an SI or an AC.** A hunk that answers to none is a candidate:
   - *incidental*: a reformat, a drive-by rename, a refactor of neighboring code, an import reshuffle. Reverting it to the fixed-point version is structural.
   - *unrequested behavior*: a parameter, flag, option or config nobody asked for; an endpoint, field or branch no AC needs; a defensive branch for a state the code cannot reach. Removing it is **behavioral**.
2. **Reuse — new code that re-implements something the repo already has.** Search the codebase for the primitive (same name family, same signature, the stack guide's list of shared utilities) and cite it at `file:line`. The substitute must honor the same contract, including the edge cases the ticket's tests exercise; a primitive that almost fits is not a substitute.
3. **Footprint — structure the change did not need.** A new file whose content fits in an existing one the ticket already touches; an interface or layer with a single implementation and no seam a test or a boundary requires; a file touched only to pass something through.
4. **Locality — one behavior spread over more files than it needs.** The *Shotgun Surgery* smell (`code-smells` skill), measured on this diff: which files each behavior touches now, and the smaller set that would hold it.

## 1. Propose
Measure the diff first (files created, files modified, lines added and removed), then walk the criteria. Each proposal carries:
- **the criterion**, and for trace whether it is *incidental* or *unrequested behavior*;
- **the evidence**: `file:line` of the hunk; for trace, which SIs and ACs were checked and why none covers it; for reuse, the existing primitive's `file:line` and why its contract matches;
- **the cut**, stated as a subtraction or a substitution, and what the diff loses: files, lines;
- **its kind**: `structural` (behavior identical) or `behavioral` (a behavior no AC asked for goes away, with the tests that exist only for it).

A proposal without evidence, one that removes behavior an AC covers, or one that needs new code, is not a trim. Drop it.

Present the proposals grouped by criterion, in order, as a structured choice, `behavioral` ones marked as such. **The user picks which to apply.** None is applied by default.

## 2. Apply, one at a time
For each chosen cut, in criterion order:
1. Make the cut.
2. Run the ticket's tests, and the suite the plan's Deliverables name.
3. **Tests.** A `structural` cut modifies no test. A `behavioral` cut may delete only the tests that exercise exclusively the behavior it removes, named in the proposal; a test that traces to an AC is never modified. A cut that needs any other test change was mis-classified: revert it and report it.
4. Green → next cut. Red → revert this one and report it; never stack a second cut on a red suite.

Put the cuts in their own commits, `structural` and `behavioral` apart, so each can be reviewed and reverted on its own. Version control remains the user's call; say which commits you suggest.

A behavioral cut removes something someone may have wanted. Record each one in the output with what it did, so it can come back as a ticket of its own if it was.

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
behavioral: <n — applied cuts that removed unrequested behavior>
reverted: <n — cuts that needed an unexpected test change or turned the suite red>
---
```

Then each proposal with its criterion, evidence, kind and outcome (`applied`, `declined`, `reverted` and why), and a **Removed behavior** section listing every applied behavioral cut. `/retro` reads the frontmatter: `before` against `after` is what trimming saved, and many unrequested-behavior proposals on the same stage point at where scope creeps in upstream.

Then hand off to `/tidy` with the same fixed point, which now shapes the smaller diff.
