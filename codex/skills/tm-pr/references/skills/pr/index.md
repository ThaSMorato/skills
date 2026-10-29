---
name: pr
description: 'Write the body of a pull request from what the work left on disk: a summary drawn as the smallest view that explains the change, evidence that it works (before and after), and how dangerous the merge is (one-way or two-way door, blast radius). Use after $thasmorato-skills:tm-tidy (or $thasmorato-skills:tm-review) when a ticket is ready to merge, and on "write the PR / PR description / open a PR".'
disable-model-invocation: true
user-invocable: false
---

A reviewer decides in minutes whether to trust a change. A PR body that retells the commits spends those minutes on what the diff already says. This one answers three questions instead: **what changed** (as a picture), **how do we know it works** (as evidence), and **what happens if it is wrong** (as danger). Skip any preamble; every sentence answers one of the three.

## Preflight
Opening the pull request is the first effect outside this machine, and each check below fails it, or makes it wrong, after the fact. Run them all before writing the body, then report the ones that fail together, each with what fixes it:
- **Blockers and branch:** `node "references/scripts/blocker-state.mjs" <ticket file>`. The branch is not the base, it is pushed and in step with its remote, and every blocker is `merged` or `done`. A blocker `in review` means this pull request stacks: its base is that blocker's branch, not the trunk.
- **Signing:** when the repo signs commits (`git config commit.gpgsign`, or a rule in the guidelines), every commit on the branch is signed: `git log --format='%h %G?' <fixed-point>..HEAD`, where `N` is unsigned.
- **Host and tracker auth:** `gh auth status` (or the host's own CLI), and the tracker's CLI when the ticket has a `Tracker:` id.
- **The tracker id:** the ticket's `Tracker:` line. `none (local only)` is an answer; a missing line is a question.
- **Acceptance is current:** the acceptance record is newer than the last change to production code (Sources says how to tell).
- **A change after the review:** a commit to production code after the review file was written, other than the `tidy/` ones (they have their own review), gets a second `$thasmorato-skills:tm-review` pass or a skip the owner states, which the body records under Review.
- **A visible change in the Direct gear:** when the diff adds a `> Decided (supersedes …)` marker that changes what the user sees (a screen, a message, an output format, an API response) and no acceptance record checks it, the work outgrew Direct. Ask before writing the body, with two options: the owner runs `$thasmorato-skills:tm-acceptance` and the ticket's acceptance criteria are rewritten to match the decision (recommended), or the pull request opens as it is, with the change named under Merge danger.
- **A file the branch did not touch:** a file in the diff against the base that no commit on the branch changed is the base moving underneath. Offer to merge the base again, or to leave the file to its own pull request. A merge on this branch that resolved a conflict owes the steps of `references/skills/implement/after-merge.md`: name the ones not done.
- **The repo's own obligations:** the pull request template (`.github/pull_request_template.md` and its kin), a changelog entry, a rule in `CONTRIBUTING` or the guidelines: the body fills them.

Committing, pushing and following CI stay with the owner: this stage checks that the first two are done and does not do them.

## Sources
Read, do not recall:
- the diff: `git diff <fixed-point>...HEAD`, the same fixed point `$thasmorato-skills:tm-review` used;
- the ticket (acceptance criteria, `Type`), the plan and its `progress.md` (the test results per SI, the **Not verified** list);
- the acceptance record, `.scratch/<feature-slug>/acceptance/<NN>-<slug>.md`: its screenshots are the evidence, and when production code (anything outside the tests and `docs/`) changed after its `verified_at`, say it is stale and offer `$thasmorato-skills:tm-acceptance` again;
- the review file under `.scratch/<feature-slug>/reviews/`: lenses run, findings and their verdicts;
- the `trim/` and `tidy/` files, when they exist: which commits are structural;
- for `Type: bugfix`, the diagnosis: its `loop`, the hypothesis that held, the seam gaps;
- for consumers of what changed: `docs/architecture/components.md`, the review's contract-compatibility findings, and, when dependencies changed, the blast radius in `docs/analysis/dependencies.md`.

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

## Decisions that change the request
<each decision this work recorded that changes what was asked: the decision, who made it, and what the request said before; `none` when there is none>

## Review
<lenses run; findings fixed; findings accepted, each with why; pre-existing ones noted as not this PR's>

Closes <ticket id: title> (`<NN>-<slug>`)
```

The `Closes` line carries the slug: it is how `blocker-state.mjs` finds this pull request from a ticket that waits on it.

### Summary
Read the `visuals` skill (`references/skills/visuals/index.md`) and pick the smallest view: a diff sketch of the call tree, the component tree or the file tree when the point is what moved; pseudocode when it is logic; a sequence diagram when it is an interaction. One view usually; two when one cannot carry it. Name the structural commits (from `trim/` and `tidy/`) apart from the behavioral ones, so the reviewer can read them separately.

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

### Decisions that change the request
Required, even when it says `none`. Read the `> Decided` markers in the ticket, the node map, the plan and the documents the diff edits, and list each one that changes what the request asked for (a criterion dropped or rewritten, a behavior the owner chose differently, a `supersedes`). A reviewer who approves the diff approves the request as changed, and should see the change rather than infer it.

## Output
Write the body to `.scratch/<feature-slug>/prs/<NN>-<slug>.md`, one file per ticket. Opening the pull request is outward-facing and the owner's call: show the body, and only when the owner asks, open it with the platform's CLI from that file (for GitHub, `gh pr create --body-file .scratch/<feature-slug>/prs/<NN>-<slug>.md`).

## Postflight
After the body is written, and again after the pull request opens:
- **Sibling placeholders:** a placeholder this ticket was meant to fill, elsewhere (a `TODO(<NN>)`, a stub, a "see ticket <NN>" line in another ticket, a follow-up), is now filled or stale; list each by path.
- **Tracker fields:** when there is a tracker, the fields it expects for a pull request (status, the linked pull request, the reviewer): say what to set, and set nothing.
- **The remaining tickets:** each ticket of the feature not yet merged, as `<NN>-<slug>` with its title, and what merging this one unblocks for it.
