> Part of the `retro` skill (see `SKILL.md`). Also read by `/session-analyze`.

# Promotion filter: before a finding becomes a skill, a guide or a rule

A project finding that turns into a skill, a stack-guide entry or a rule is loaded again on every later run. A generic one is worse than none: it competes with the good ones when the model picks what to load, and it teaches nothing the model did not already know. So before **proposing** that a finding become one of these, it has to pass all three questions:

1. **It can't be found in five minutes.** A search, the library's docs or the language's manual would not give it. "Use parameterized queries" fails; "this repo's `QueryBuilder.raw` skips the tenant scope, use `scoped_raw`" passes.
2. **It is specific to this codebase.** It names a real file, error message, command, module or convention of this repository: `file:line`, the literal error, the actual command.
3. **It cost real effort.** It came out of an investigation, a correction the owner had to make, or a mistake that came back. In a retro, repetition across tickets is that evidence; in a session, a repeated owner turn is.

It also fails when its **trigger is vague**: words that match every task ("errors", "tests", "be careful") make it load everywhere and help nowhere. A promotable finding says when it applies in terms the task will contain (the file pattern, the error text, the command).

## A mechanical finding becomes a check
When a finding that passes is **mechanical** (a pattern a linter, a hook or a CI job can see), propose the check, not a rule in prose: a check fires every time, prose only when someone reads it. `environment.md` has the classification.

## What happens to a finding that fails
It stays in the report as a finding, with **which question it failed**. It is simply not proposed as a skill, guide or rule. The owner still decides what gets written; the filter narrows what is proposed, it does not apply anything.

This filter is for **project** findings. A `flow` finding (a change to the plugin's own stages) is judged by whether it would recur on any project, which is a different question.
