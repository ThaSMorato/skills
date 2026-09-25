---
name: tidy
description: 'After a ticket is reviewed, make its code simple — Kent Beck''s four rules of Simple Design, applied in order to the code the ticket changed: propose each tidying with evidence, apply only the ones the user picks, one at a time, as structural changes with the tests untouched and green. Use after /review, on "tidy / simplify / clean up this ticket".'
disable-model-invocation: true
---

Make it work, then make it right. `/implement` made the ticket work, and `/review` checked it; this stage makes it **simple**. It is the *After* in Beck's *Tidy First?* (tidy after the behavior ships), because only once the code works can you see the shape it wanted to have.

## The criterion: the four rules, in order
Kent Beck's four rules of Simple Design, as Robert C. Martin sets them out in *Clean Code* (chapter on Simple Design). **The order is the instruction.** A design is simple when it:

1. **Is covered by tests** — code that can be tested is decoupled code.
2. **Maximizes expression** — every piece in the right place, revealing the underlying abstraction.
3. **Minimizes duplication** — removing the *essential* duplication (two places that must change together), and leaving the *accidental* kind (code that only looks alike) alone.
4. **Minimizes size** — fewest elements possible **without compromising** 1–3: remove functions, classes and parameters that nothing needs.

**Rule 1 is already satisfied by `/implement`**, which is test-first. So this stage starts at rule 2, and never runs rule 4 before 2 and 3. Deleting code first is how expressiveness gets destroyed in the name of brevity. If some changed behavior turns out to have **no** test, stop: that is a rule-1 failure and a review finding, not a tidying.

"Simple" means **untangled**: high-level policy that ignores low-level detail. When a tidying is about that (a framework type in a use case, SQL in a domain object), the `architecture` skill's dependency-rule and detail rules say what the untangled shape is.

## Scope: what this ticket changed
Only the code in the ticket's diff (`git diff <fixed-point>...HEAD`), the same fixed point `/review` used. Tidying code the ticket did not touch is a different change, with a different reviewer and a different risk. Note it as a candidate for later, and leave it.

## 1. Propose
Walk the diff rule by rule, 2 → 3 → 4, and propose each tidying with:
- **the rule** it serves, and for rule 2 the smell it removes (from the `code-smells` and `clean-code` skills);
- **the evidence**: `file:line` of what is there now;
- **the change**, stated as a structural move (rename, extract, inline, move, remove), and **why it is structural**: behavior is identical;
- for rule 3, **which kind of duplication**, and why it is the essential kind;
- for rule 4, **what would break if the element were needed**, and why it is not.

A proposal with no evidence, or one that changes behavior, is not a tidying. Drop it.

Present the proposals grouped by rule, in order, as a structured choice. **The user picks which to apply.** None is applied by default.

## 2. Apply, one at a time
For each chosen tidying, in rule order:
1. Make the change.
2. Run the ticket's tests, and the suite the plan's Deliverables name.
3. **Existing tests are not modified.** If a test has to change for the tidying to pass, the tidying was not structural: revert it, report it, and move on. Do not rewrite the test to fit.
4. Green → next tidying. Red → revert this one and report it; never stack a second change on a red suite.

Structural changes go in their own commit, separate from the behavioral work, so each can be reviewed and reverted on its own. Version control remains the user's call; say which commits you suggest.

## Output
Write `.scratch/<feature-slug>/tidy/<NN>-<slug>.md`:

```markdown
---
kind: tidy
slug: <NN>-<slug>
fixed_point: <ref>
proposed: {expression: <n>, duplication: <n>, size: <n>}
applied: <n>
reverted: <n — tidyings that needed a test change or turned the suite red>
---
```

Then each proposal with its rule, evidence and outcome (`applied`, `declined`, `reverted` and why), and the out-of-scope candidates as notes. `/retro` reads it: many `reverted` means the proposals were not really structural.
