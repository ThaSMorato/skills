> Part of the `acceptance` skill (see `<plugin root>/agent-references/skills/acceptance/index.md`), its last step. Also read by `fdd-writer`, when a migrated feature arrives with criteria already delivered and never absorbed.

# Absorb the delivered criteria

An acceptance criterion is the yardstick of one delivery: it says when a ticket is done, and after that it says nothing a reader of the system needs. What it verified, though, is now true of the system, and the feature's living documents have to say so. Absorbing is that move: each delivered criterion becomes a **rule** in the present tense, in the feature's `fdd.md`, or leaves because a flow or contract there already says it. The living-document rules are in `<plugin root>/agent-references/skills/doc-validate/living.md`.

## When
Only after every item of this acceptance passed. A criterion is **delivered** when every ticket whose ACs trace to it has a passing acceptance record. Tickets trace to it through each AC's `(from <feature> AC-n)`.

## For each criterion of `.scratch/<effort>/criteria/<feature>.md` that this ticket delivered
1. **Find the owners.** Grep the feature's tickets (`.scratch/<feature-slug>/issues/*.md`) for the criterion's id. If one of them has no passing acceptance record yet, mark the criterion `delivered (<this ticket>), waiting on <tickets>` and stop for it.
2. **Decide where it goes**, one of:
   - **a rule** under the FDD's `## Rules`: the behavior in the present tense, with the next free rule id (`R-n`), what the criterion verified, and `Tested by:` with the test that proves it (the test name, never `path:line`); a criterion verified only in the browser says `Verified by: $thasmorato-skills:tm-acceptance <NN>-<slug>`;
   - **a contract or flow detail**, when the criterion pinned an error, a status or a limit that the FDD's flow or contract describes vaguely: edit that line instead of adding a rule;
   - **nothing**, when a flow or contract in the FDD already says exactly this. Say which line.
3. **Mark it** in the criteria file: `absorbed (R-n)`, `absorbed (<section>)` or `absorbed (already in <section>)`.
4. **The feature README** gets the test under `Tests`, when the rule named one.

Edit the FDD with `Edit`, one section at a time. A criterion whose rule would contradict a decided contract is not absorbed: it is a finding, reported in the gate.

## Product criteria
A product criterion in `.scratch/<effort>/scope.md` is delivered when the features it spans are. It becomes a rule in `docs/product/prd.md` only when no requirement there already states it; otherwise it is marked `absorbed (already in RF-n)`.

## Report
In the gate, one line per criterion: its id and words, where it went (or who it is waiting on), and the test named. The edits stay uncommitted with the rest of the branch: they are part of the change the pull request reviews.
