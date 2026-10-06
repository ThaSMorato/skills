---
name: tidy
description: 'Make working code simple by Kent Beck''s four rules of Simple Design, as structural changes only — either the code a reviewed ticket changed, or a path of existing code that has tests covering it. Use after /review, or on "tidy / simplify / clean up this ticket", "clean up this file / this area", "leave it cleaner". Not for behavior changes or bug fixes; use tdd for those.'
disable-model-invocation: true
---

Make it work, then make it right. `/implement` made the ticket work, and `/review` checked it; this stage makes it **simple**. It is the *After* in Beck's *Tidy First?* (tidy after the behavior ships), because only once the code works can you see the shape it wanted to have.

## The criterion: the four rules, in order
Kent Beck's four rules of Simple Design, as Robert C. Martin sets them out in *Clean Code* (chapter on Simple Design). **The order is the instruction.** A design is simple when it:

1. **Is covered by tests** — code that can be tested is decoupled code.
2. **Maximizes expression** — every piece in the right place, revealing the underlying abstraction. Read each function in scope with the altitude lens (`code-smells` → `mixed-altitude`): a body that mixes intent, domain calls and mechanics is the most common expression failure in working code.
3. **Minimizes duplication** — removing the *essential* duplication (two places that must change together), and leaving the *accidental* kind (code that only looks alike) alone. Collapse the **whole** duplicated unit, not the easy half: deduplicating how two results are assembled while two near-identical queries stay behind still ships the duplication. Rules 2 and 3 are separate checks; passing one says nothing about the other.
4. **Minimizes size** — fewest elements possible **without compromising** 1–3: remove functions, classes and parameters that nothing needs, and guards an extraction left dead (an `if (x)` that an earlier check already guarantees).

**Rule 1 is already satisfied by `/implement`**, which is test-first. So this stage starts at rule 2, and never runs rule 4 before 2 and 3. Deleting code first is how expressiveness gets destroyed in the name of brevity. If some changed behavior turns out to have **no** test, stop: that is a rule-1 failure and a review finding, not a tidying.

"Simple" means **untangled**: high-level policy that ignores low-level detail. When a tidying is about that (a framework type in a use case, SQL in a domain object), the `architecture` skill's dependency-rule and detail rules say what the untangled shape is.

## Scope: a ticket's diff, or a path
**Ticket mode** (`/tidy <slug> <fixed-point>`): only the code in the ticket's diff (`git diff <fixed-point>...HEAD`), the same fixed point `/review` used. Tidying code the ticket did not touch is a different change, with a different reviewer and a different risk. Note it as a candidate for later, and leave it.

**Path mode** (`/tidy <path>`): existing code with no ticket, such as a crusty area worth cleaning while you are in it. The scope is the files under the path. There is no review to wait for, so rule 1 is checked here instead: **name the tests that cover the code in scope** and run them green before proposing anything. Code with no covering test cannot be tidied, because nothing can prove its behavior was kept; say so, and suggest covering it first (a ticket, or `tdd`). The fixed point is `HEAD` when the stage starts.

In either mode, a function you touch is read **whole** with the rules, not only its changed lines: having touched it is not evidence that it is clean.

## 1. Propose
**Read `docs/declined.md` first**, when it exists (`${CLAUDE_PLUGIN_ROOT}/templates/declined.md` has its format). A proposal that matches a `declined` entry (the same kind of move, over a scope the entry covers) is not proposed again unless its **Revisit when** has happened; say which entries suppressed what (*"skipped 2, per D-004 and D-011"*), so a suppression is never silent.

Walk the diff rule by rule, 2 → 3 → 4, and propose each tidying with:
- **the rule** it serves, and for rule 2 the smell it removes (from the `code-smells` and `clean-code` skills);
- **the evidence**: `file:line` of what is there now;
- **the change**, stated as a structural move (rename, extract, inline, move, remove), and **why it is structural**: behavior is identical. Four things break "pure" refactors most often; say for each that it holds:
  - **order** — a list read by position, or searched for "the other one", encodes behavior in its order;
  - **errors and side effects** — the same failures raised, the same writes, in the same order;
  - **observability** — the same logs, metrics and trace spans. Merging two near-copies where only one was traced must keep that asymmetry;
  - **type breadth** — no type narrowed under a caller, and none weakened (no new `any`, `Object`, `interface{}`).
- for rule 3, **which kind of duplication**, and why it is the essential kind;
- for rule 4, **what would break if the element were needed**, and why it is not;
- **its strength** (`visuals` skill): *Strong*, *Worth exploring* or *Speculative*, and the gain in the project's terms, never "cleaner".

A proposal with no evidence, or one that changes behavior, is not a tidying. Drop it.

Present the proposals grouped by rule, in order, as a structured choice. Where a proposal moves code between functions or files, show its before and after as the smallest view the `visuals` skill lists (a call tree or file tree diff sketch), next to it. **The user picks which to apply.** None is applied by default.

**When the owner declines a proposal with a reason that will still hold next time**, offer to record it in `docs/declined.md`, so no later run proposes it again. A passing reason ("not now") or a self-evident one is not recorded; a reason that is really an architectural decision is an ADR instead (`/adr-generate`).

**In path mode, offer the HTML report** before asking: a path usually yields more proposals than a list carries well. Call the Skill tool with `visuals` and render one card per proposal with `html-report.md`, then ask from the report.

## 2. Apply, one at a time
For each chosen tidying, in rule order:
1. Make the change.
2. **If it extracted a helper, re-read the helper** under rules 2 and 3 before running anything: it is now code you wrote. A helper that is itself mixed-altitude, or duplicates another, means the mess moved down a level; that is a new proposal, not a finished tidying.
3. Run the ticket's tests, and the suite the plan's Deliverables name (in path mode, the covering tests you named).
4. **Existing tests are not modified.** If a test has to change for the tidying to pass, the tidying was not structural: revert it, report it, and move on. Do not rewrite the test to fit.
5. Green → next tidying. Red → revert this one and report it; never stack a second change on a red suite.

Structural changes go in their own commit, separate from the behavioral work, so each can be reviewed and reverted on its own. Version control remains the user's call; say which commits you suggest.

## 3. Review what the tidying changed
Green tests prove the behavior the tests cover; they do not prove the code got better, and this stage runs **after** `/review`, so nothing else will read it. Take the diff of the applied tidyings alone (from the commit before the first one to `HEAD`) and call the Agent tool with `review-spec` and with `review-quality` on it, in parallel, the way `/review` dispatches its lenses:
- **`review-spec`**, told that the change claims to be **structural**: any behavior it finds changed is a finding.
- **`review-quality`**: a tidying that introduced a smell, or traded one smell for another, is a finding.

Drop findings without a rule and a failure scenario, as `/review`'s synthesis does. For each finding that stands, revert the tidying it points at and record why. A tidying that survives its own review is done.

## Output
Write `.scratch/<feature-slug>/tidy/<NN>-<slug>.md` (in path mode, `.scratch/standalone/tidy/<path-slug>.md`, with `slug:` set to the path):

```markdown
---
kind: tidy
slug: <NN>-<slug>
fixed_point: <ref>
proposed: {expression: <n>, duplication: <n>, size: <n>}
applied: <n>
reverted: <n — tidyings that needed a test change, turned the suite red, or failed step 3's review>
review_findings: <n — findings step 3's review raised and kept>
---
```

Then each proposal with its rule, evidence and outcome (`applied`, `declined`, `reverted` and why), and the out-of-scope candidates as notes. `/retro` reads it: many `reverted`, or any `review_findings`, means the proposals were not really structural.
