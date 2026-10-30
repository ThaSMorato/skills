---
name: steering-validate
description: 'Validate the instructions an agent follows in this repo against each other: CLAUDE.md and AGENTS.md at every level, the path-scoped rules, the stack and testing guides, the guidelines router. Finds contradictions, references to nothing, duplicates that will drift, and an instruction another one overrides in silence, and emits a clean/dirty verdict. Use after $thasmorato-skills:tm-guidelines or $thasmorato-skills:tm-generate-stack-guide, when an instruction did not hold, or on "check CLAUDE.md / do my rules contradict each other".'
disable-model-invocation: true
user-invocable: false
---

An agent working in this repo reads several instruction files at once: the root `CLAUDE.md`, the one in the subproject, the rule scoped to the file it is editing, the stack guide the router names. When two of them disagree, the agent follows one in silence, and which one depends on what loaded first. This stage reads them all together and says where they disagree. It finds problems; it changes no file.

## 1. Inventory
Run `node "references/scripts/steering-files.mjs"`. It prints every steering file with its kind (and a rule's `paths`), the references to paths that do not exist (`stale`, with their line), and the rules whose paths match no file yet (`unmatched`). Read every file it lists, and the commands table of `docs/guidelines.md` against the repo's manifests.

An `unmatched` rule is not a finding by itself: it may be for files still to come. It is one only when neither the router nor any plan names such a path.

## 2. Check
Two files conflict only when they apply to the same files: a rule's `paths`, a `CLAUDE.md` or `AGENTS.md`'s directory, the router's file patterns. Each finding cites both sides by `file:line` and quotes them; a finding with one side is not a contradiction.

| Id | Category | When | Makes it `dirty` |
|---|---|---|---|
| `CT` | contradiction | two files tell the agent opposite things for the same files: named exports against default exports, `pnpm` in one and `npm` in the router's commands | yes |
| `SR` | stale reference | a path, a command or a guide that a file cites and the repo does not have: the script's `stale`, a command no manifest defines, a guide the router names that is not there | yes |
| `DP` | duplicate | the same rule written in two places, which will drift: a `CLAUDE.md` that copies a stack guide's rule instead of pointing at it | yes |
| `SH` | shadowed | a narrower file (a subproject's `CLAUDE.md`, a rule scoped to its paths) overrides a broader one without saying so; an override that says it overrides is not a finding | yes |
| `PL` | plugin divergence | a repo guide or rule that contradicts one of the plugin's skills (`testing`, `clean-code`, `code-smells`, `architecture`) | no |

`PL` is information and never makes it `dirty`: the project's own guide wins over the plugin's skill by design. It is listed so the owner sees the override in force, and so a divergence nobody meant becomes visible.

## 3. Output
Write `docs/validation/steering.md`:

```markdown
---
kind: steering-validation
plugin_version: 0.7.0
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
instructions: [<every value the project instructions already in your context ask this field to list, exactly as written; [] when none does; never open a file to find one>]
status: clean | dirty
run: <1 on the first validation; +1 on every re-run>
files: <count of steering files read>
findings: {CT: <n>, SR: <n>, DP: <n>, SH: <n>, PL: <n>}
---

# Steering validation

| Id | Category | Both sides (`file:line`, quoted) | Who fixes it |
|---|---|---|---|
```

The verdict is `dirty` when any `CT`, `SR`, `DP` or `SH` is found. Each fix belongs to whoever owns the file: `$thasmorato-skills:tm-guidelines` for the router, the rules and the generated `CLAUDE.md` and `AGENTS.md` pointers; `$thasmorato-skills:tm-generate-stack-guide <tech>` for a stack guide; `$thasmorato-skills:tm-generate-test-guide` for the testing guide; the owner for a `CLAUDE.md` they wrote themselves. Then stop with the verdict and the findings: this stage changes no file, and the owner runs the stage that fixes each.
