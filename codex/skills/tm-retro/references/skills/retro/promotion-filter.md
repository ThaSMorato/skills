> Part of the `retro` skill (see `references/skills/retro/index.md`). Also read by `$thasmorato-skills:tm-session-analyze`.

# Promotion filter: before a finding becomes a skill, a guide or a rule

A `repo-skill` finding that turns into a skill, a stack-guide entry or a rule is **prose the agent loads again on every later run**. A generic one is worse than none: it competes with the good ones when the model picks what to load, and it teaches nothing the model did not already know. The filter exists for that cost, so it gates only what would become prose.

## A mechanical finding goes straight to a check
Classify the finding first, by `references/skills/retro/environment.md`: mechanical or judgement. A **mechanical** one (a pattern a linter, a hook or a CI job can see) goes straight to a check, with no question here to pass: a check adds nothing to the agent's context and fires every time, where prose fires only when someone reads it. A common lint rule that anyone could find in five minutes is still worth wiring in.

## A judgement finding passes all three questions
1. **It can't be found in five minutes.** A search, the library's docs or the language's manual would not give it. "Use parameterized queries" fails; "this repo's `QueryBuilder.raw` skips the tenant scope, use `scoped_raw`" passes.
2. **It is specific to this codebase.** It names a real file, error message, command, module or convention of this repository: `file:line`, the literal error, the actual command.
3. **It cost real effort.** It came out of an investigation, a correction the owner had to make, or a mistake that came back. In a retro, repetition across tickets is that evidence; in a session, a repeated owner turn is.

It also fails when its **trigger is vague**: words that match every task ("errors", "tests", "be careful") make it load everywhere and help nowhere. A promotable finding says when it applies in terms the task will contain (the file pattern, the error text, the command).

## What happens to a finding that fails
It stays in the report as a finding, with **which question it failed**, and is left out of the proposals. The owner still decides what gets written: the filter narrows what is proposed and applies nothing.

A `flow` finding (a change to the plugin's own stages) is judged by a different question, whether it would recur on any project (`references/skills/retro/levels.md`).
