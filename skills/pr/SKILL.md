---
name: pr
description: 'Write the body of a pull request from what the work left on disk: a summary drawn as the smallest view that explains the change, evidence that it works (before and after), and how dangerous the merge is (one-way or two-way door, blast radius). Use after /tidy (or /review) when a ticket is ready to merge, and on "write the PR / PR description / open a PR".'
---

A reviewer decides in minutes whether to trust a change. A PR body that retells the commits spends those minutes on what the diff already says. This one answers three questions instead: **what changed** (as a picture), **how do we know it works** (as evidence), and **what happens if it is wrong** (as danger). Skip any preamble; every sentence answers one of the three.

## Sources
Read, do not recall:
- the diff: `git diff <fixed-point>...HEAD`, the same fixed point `/review` used;
- the ticket (acceptance criteria, `Type`), the plan and its `progress.md` (the test results per SI, the **Not verified** list);
- the review file under `.scratch/<feature-slug>/reviews/`: lenses run, findings and their verdicts;
- the `trim/` and `tidy/` files, when they exist: which commits are structural;
- for `Type: bugfix`, the diagnosis: its `loop`, the hypothesis that held, the seam gaps;
- for consumers of what changed: `docs/components.md`, the review's contract-compatibility findings, and, when dependencies changed, the blast radius in `docs/analysis/dependencies.md`.

Use the glossary's terms (`CONTEXT.md`), and resolve every id as the `asking` skill says: a reviewer does not have the ticket open.

## The body

```markdown
## Summary
<one or two sentences: what the change does, in domain words>

<the smallest view that makes it clear>

## Evidence
- **Before:** <failing test, error output, or screenshot>
  **After:** <the same test passing, the corrected output, or the new screenshot>

<not verified, when anything is>

## Merge danger
**Door:** <one-way | two-way>: <why>
**Blast radius:** <one word>: <who or what is affected if it is wrong>

## Review
<lenses run; findings fixed; findings accepted, each with why; pre-existing ones noted as not this PR's>

Closes <ticket id: title>
```

### Summary
Call the Skill tool with `visuals` and pick the smallest view: a diff sketch of the call tree, the component tree or the file tree when the point is what moved; pseudocode when it is logic; a sequence diagram when it is an interaction. One view usually; two when one cannot carry it. Name the structural commits (from `trim/` and `tidy/`) apart from the behavioral ones, so the reviewer can read them separately.

**Done when** someone who has not read the ticket can say what the change does from the summary alone.

### Evidence
Concrete proof, as a before and an after, strongest first:
- **A screenshot** when the change is visual and the environment can take one (a browser tool): the strongest evidence there is.
- **A test run**: the test that was red before and is green now, named by path, with its steps as short pseudocode (`given a cart with an expired coupon, when checking out, then the total ignores it`). For a bugfix, the diagnosis `loop`, red on the original scenario before and green after.
- **Output**: a command and what it printed, before and after.

Everything in the plan's **Not verified** list, and every diagnosis seam gap, goes here by name. A PR that hides what was not checked borrows trust it has not earned.

**Done when** every acceptance criterion has a line of evidence or is named as not verified.

### Merge danger
- **Door.** A **two-way door** can be walked back by reverting the commit: code behind an interface, a refactor, a feature behind a flag. A **one-way door** cannot: a schema migration that drops or rewrites data, a deleted record or file, a published API, event or message format others consume, a call to an external system that acts (sends, charges, deletes), a public URL or identifier. Say which, and which part makes it so.
- **Blast radius.** One word (`local`, `module`, `service`, `consumers`, `users`, `data`), then what breaks if the change is wrong: the consumers of a changed contract, the screens a layout change reaches (and their mobile and dark variants), the jobs that read a changed table. Consider every way it can spread, not only the intended one.

**Done when** the door names its reason and the blast radius names who is affected.

## Output
Write the body to `.scratch/<feature-slug>/pr.md`. Opening the pull request is outward-facing and the owner's call: show the body, and only when the owner asks, open it with the platform's CLI from that file (for GitHub, `gh pr create --body-file .scratch/<feature-slug>/pr.md`).
