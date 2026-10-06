---
name: walkthrough
description: 'Teach the owner the change the AI built, before it merges: a short HTML lesson over the ticket''s diff (what it does in domain words, where it lives, the path through the code for each acceptance criterion, what can go wrong) with a recall quiz, so nobody approves code they do not understand. Use after /review or /tidy and before /pr, or on "walk me through this change / explain what you built".'
disable-model-invocation: true
---

The risk this suite cannot test away is an owner who approves code they do not understand: the tests are green, the review is clean, and nobody who will maintain it knows how it works. This stage turns the ticket's diff into a short lesson for the owner, and checks the understanding with a quiz before the change merges.

## Sources
- the diff: `git diff <fixed-point>...HEAD`, the fixed point `/review` used;
- the ticket's acceptance criteria, the node map (its nodes, Open decisions, Analogues), the plan, and `progress.md` (the **Not verified** list);
- the review file (findings accepted rather than fixed), the `trim/` and `tidy/` files;
- the glossary (`CONTEXT.md`) and the ADRs the node map cites.

Teach the code **as it is now**, read from the files, not from what the plan intended.

## The lesson
One self-contained HTML file. Call the Skill tool with `visuals` for the views and the HTML conventions, and follow the lesson shape and quiz rules of `${CLAUDE_PLUGIN_ROOT}/skills/teach/lessons.md`. Sections, in order:

1. **What it does**, in two or three sentences of domain words: the behavior a user now gets, by acceptance criterion.
2. **Where it lives**: a file or component tree diff sketch of what was added and changed, and the main flow as a call tree. One picture, the whole change.
3. **The path, per criterion.** For each acceptance criterion, the route through the code that delivers it: entry point, the calls that matter, where the decision is made, where the data is stored or sent. Short excerpts with `file:line`, never whole files. Next to each, **why it is shaped this way** when the node map or an ADR says so (*"the price is computed in `Pricing`, not in the handler: node map, Open decisions, D-2"*).
4. **What can go wrong**: the edge cases the code handles and where; the review findings accepted instead of fixed, and why; everything in the **Not verified** list.
5. **Quiz**: three to five questions a person can only answer by understanding the change, not by remembering words from the lesson: *"An order with an expired coupon reaches checkout. Which module decides the total, and what does it ignore?"*. Every option the same length and form; feedback that cites the `file:line` that answers it.

**Done when** every acceptance criterion has its path in section 3 and at least one quiz question touches each section 3 path that carries a decision.

Save it to `.scratch/<feature-slug>/walkthrough/<NN>-<slug>.html`, open it for the owner, and print the path.

## After the quiz
Ask the owner, as a structured choice, which questions they missed or were unsure of. For each, explain that part again from the code, with the excerpt, until they can answer it. A part that stays unclear after that is a finding about the code, not about the owner: code its own owner cannot follow is a candidate for `/tidy` (rule 2, expression) or a design question, and the owner decides which before the merge.

## Output
Beside the lesson, write `.scratch/<feature-slug>/walkthrough/<NN>-<slug>.md`:

```markdown
---
kind: walkthrough
slug: <NN>-<slug>
fixed_point: <ref>
questions: <n>
missed: <n answered wrong or unsure the first time>
unclear_after: <n still unclear after the re-explanation>
---
```

Then each missed question, what was re-explained, and each `unclear_after` with what the owner chose. `/retro` reads the counts: many misses across tickets point at code, or a flow, that produces changes their owners cannot follow.
