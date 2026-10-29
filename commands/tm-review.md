---
description: Review the diff since a fixed point across narrow lenses in parallel (quality, tests, security, spec, standards, architecture, data, docs, and UI when the diff touches it), then synthesize, and verify every finding against the code before you decide.
argument-hint: "<fixed point: commit/branch/tag, e.g. main or HEAD~5> [--worktree <manifest>]"
disable-model-invocation: true
---

Review the diff between `HEAD` and the fixed point: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## 1. Preflight
If no fixed point was given, ask for one (a commit SHA, branch, tag, or merge-base like `main`). Then confirm it resolves (`git rev-parse`) and the diff is non-empty: a bad ref or an empty diff fails here, not inside six agents.

**Uncommitted work.** With `--worktree <manifest>` (the list of files `/tm-implement` wrote to `.scratch/<feature-slug>/plans/<NN>-<slug>/manifest.txt`), the review compares the working tree with the fixed point for exactly the manifest's files: `git diff <fixed-point> -- <files>` for the tracked ones, and `git diff --no-index /dev/null <file>` for each new one. A change outside the manifest is someone else's (another session, the owner's own edit): it stays out of the diff and out of the findings, as it does in the committed mode; tell every lens so, and name it once in the report as outside this review. Without the flag, when the ticket's files have uncommitted changes, say so and offer the mode. **Never commit to satisfy this preflight**: committing is the owner's call, and a commit made to get a non-empty diff takes it from them.

## 2. Compute the diff once
Write `git diff <fixed-point>...HEAD` (three-dot, vs the merge-base) to a scratch file, and collect the commit list; in worktree mode, write the manifest's diff from the preflight instead, and say there are no commits yet. Every reviewer receives **the path to that file**, not the instruction to compute it: nine agents each running the same diff is nine times the cost for one result, and the same work redone by every lens.

## 3. Fan out
Call the Agent tool once per lens below, all **in a single message** so they run in parallel. Each is narrow on purpose: a narrow lens can be held to *"every rule, against every changed hunk"*, which is a bar no agent doing five jobs can meet. Give each one the diff path, the fixed point, and the artifacts its own definition names.

| Agent | Lens |
|---|---|
| `review-quality` | code smells and clean-code, together |
| `review-tests` | criteria coverage, seams, determinism, the test DSL |
| `review-security` | CWE-level weaknesses |
| `review-spec` | plan / ticket / FDD: all of it, and only it |
| `review-standards` | the repo's own guidelines, stack guides, ADRs, glossary |
| `review-architecture` | boundary contract, cycles, detail leaking into policy |
| `review-data` | what each line costs against real data: N+1, queries in loops, indexes, unbounded reads, transactions, caches |
| `review-docs` | documentation the diff made false: README steps, env vars, flags, described behavior |
| `review-ui` | **only when the diff touches UI code**: keyboard, focus, accessible names, contrast, loading/empty/error states, layout shift, slow interactions |

**Pass the findings earlier tickets left open.** From the feature's earlier reviews (`.scratch/<feature-slug>/reviews/*.md`), the findings the verifier confirmed and not fixed (deferred, or left for later) that sit in files this diff touches go to the lens that raised them, as leads: whether this diff fixed, kept or worsened each one. A finding confirmed and not fixed that nobody passes on is rediscovered as new, or never again.

If `/tm-trim` ran, `.scratch/<feature-slug>/trim/<NN>-<slug>.md` has an **Unrequested behavior** section: hand it to `review-spec` as leads (behavior in the diff that no AC asked for, which trimming could not cut because cutting it changes behavior). Leads, not findings: the lens confirms each against the plan and the ticket like anything else.

When `docs/architecture/boundaries.md` doesn't exist, `review-architecture` has no contract of edges to judge against: tell it so, and it runs only its **contract-compatibility** check (a published API, event or interface changed incompatibly), which needs no boundary file. Call the Agent tool with `review-ui` only when the diff touches UI code (components, templates, styles, client-side views); otherwise record it in `lenses_skipped` with the reason. Every skip is said out loud.

**Pass `docs/declined.md` to every lens** when it exists: proposals the owner already turned down, with the scope and the reason. A lens does not raise a finding that matches a `declined` entry (same kind, a scope the entry covers) unless the entry's **Revisit when** has happened; if it believes that has happened, it raises the finding and cites the entry.

**Every lens may follow the call one hop outside the diff.** Tell each agent so when you dispatch it: it may open the definition of any function the changed code calls, one level deep, and judge it against its own lens. A diff-scoped lens is structurally blind to the defect that lives one call away. The loop is in the diff and the query is in a repository that did not change. The cycle closes through an untouched file. The tainted value reaches a sink in a helper. A finding found through a hop cites **both** locations, the changed call site and the unchanged code, and it is about **this** change: the diff made the unchanged code expensive, reachable or wrong. Unchanged code that was already wrong on its own is the verifier's `pre-existing`. One hop, not a walk: a lens that follows the whole call graph is reviewing the repository, not the change.

## 4. Synthesize: this step is not optional
Narrow agents trade precision for recall, and the two costs land here:

- **Duplicates.** A long function is Long Function to the quality lens and a missed convention to the standards lens. Group findings by `file:line`, merge the ones that are the same finding, and keep the clearest naming.
- **Primed findings.** Each agent is looking for its own subject and will produce plausible material on demand. **Drop any finding without a named rule and a concrete failure scenario**: that is the filter, and applying it is most of what this step does.
- **Severity drift.** Each lens believes its own subject matters most. Re-rank across all of them on the shared scale, judging by consequence rather than by which agent reported it. **Lowering a lens's severity needs a reason in the finding:** a `- **Mitigated by:**` line naming what contains it (`file:line` of the guard, the constraint, the caller that never passes that value). With nothing to cite, the lens's severity stands. Findings about **data loss, security or money are never lowered** in synthesis; only the verifier's code check can refute them.

## 5. Persist
Write the merged findings to `.scratch/<feature-slug>/reviews/<NN>-<slug>.md`, most-severe first. Give each one `file:line`, the rule it violates, the failure scenario, the fix, and a `- **Lenses:** <lens>, <lens>` line naming every lens that raised it; merged duplicates keep all their lenses. Record the fixed point, the lenses that ran, and the lenses that were skipped and why:

```markdown
---
kind: review
plugin_version: <the "version" in ${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json>
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
slug: <NN>-<slug>
fixed_point: <ref>
mode: committed | worktree
run: <1 on the first review of this ticket; +1 on every re-run>
lenses_run: [quality, tests, security, spec, standards, architecture, data, docs, ui]
lenses_skipped: [<lens>: <reason>]
findings: <count>
by_severity: {critical: <n>, high: <n>, medium: <n>, low: <n>}
by_lens: {quality: <n>, tests: <n>, security: <n>, spec: <n>, standards: <n>, architecture: <n>, data: <n>, docs: <n>, ui: <n>}
---
```

The severity keys stay in English whatever language the headings are in. In `by_lens`, a finding raised by two lenses counts once for each, so the lens counts can sum to more than `findings`; that overlap is itself worth seeing. These counts are how `/tm-retro` tells which lens earns its cost on this project, and a lens that is attributed nowhere cannot be judged.

Without the file, a review's findings live only in this conversation and are gone at the next `/compact`. `/tm-retro` reads these across a whole epic to find the finding that **repeats**; and a finding that recurs across tickets is a standard that should move into a stack guide or a rule, which is a conclusion no single review can reach.

## 6. Verify against the code: before the user sees anything
Call the Agent tool with `review-verifier`, passing the review file, the diff file and the fixed point. It opens every cited location and annotates each finding with a verdict backed by code: `confirmed`, `wrong location`, `rule does not apply`, `impossible scenario`, `already handled`, `duplicate` or `pre-existing`. Write what it returns into the review file: a `- **Verdict:** <verdict>: <evidence>` line under each finding, and its `verdicts`, `refuted_by_lens` and `precedents` counts in the frontmatter. Leave `findings`, `by_severity` and `by_lens` as they are: they count what the lenses raised, and the verdicts are a separate column.

Synthesis filters findings by what they say about themselves; this filters them by what the repository says. One verifier sees the whole set, which is what lets it call a `duplicate`. It **never deletes**: in doubt, a finding stays `confirmed`, because a false positive costs a minute of reading and a false negative ships.

## 7. Report
Show the findings **ordered by verdict, then severity**: `confirmed` first, then `pre-existing` (real, but not this change's work), then the refuted ones and duplicates last, each with its one line of evidence. Nothing is hidden: the user may disagree with a verdict, and the finding is still there to act on. Then add a one-line note per lens saying what it covered, and name any lens that was skipped or that reported having no standard to apply.

The user decides what to fix. Ask it as one structured choice, the cut by severity first: **fix every confirmed critical, high and medium, docs included** (recommended), **also the lows**, **choose per finding**, **none now**. A confirmed finding left out of the recommended cut, inside a severity it covers, is named with the reason. Then, per finding where they apply:
- **A fix that changes what a caller or the user observes** (a limit, a control, a text, a contract, a new acceptance criterion) is its own question, before any code: the review found the problem, and the owner decides what the system does about it.
- **A value no source gives** (the new limit, the words of a message) is asked without a recommendation: a recommended value is an assumption in disguise.
- **A finding that cites a rule the project wrote** (a guideline, a stack guide, an ADR) recommends complying; deviating is the other option, and an ADR if it should last.
- **A finding against a decision approved above this ticket** (the FDD, the plan) that changed after the approval: the recommended option is to deliver as approved, with a follow-up for the change; reopening the approved design is the other.
- **A pre-existing defect that blocks one of this ticket's ACs** is offered as fix in this ticket: an AC this ticket cannot pass is this ticket's to fix, however old the cause.

### Fixing what was chosen
Choosing the fixes starts the loop: fix them now, most severe first, each test-first through the `tdd` loop when it changes behavior. A fix that adds an acceptance criterion names the SI that owns it, or a new SI the owner adds with `/tm-plan <slug> amend "<the change>"`; a criterion nobody owns is not checked by anyone. A fix to UI or CSS is measured in the browser (the computed style of the element, the checks in `${CLAUDE_PLUGIN_ROOT}/skills/acceptance/visual-checks.md`) before it counts as fixed: a style that looks right in the diff can lose to a rule above it in the cascade.

Every finding leaves this phase with a line in the review file, under its verdict: `- **Outcome:** fixed (<file:line or commit>)`, `declined (<the reason>)` or `deferred (<the follow-up>)`. The phase ends with a structured question: close the review, with every outcome written, or another round (`run` + 1).

**The third `dirty` run stops the loop.** A review is `dirty` while it has confirmed findings inside the recommended cut. When `run` reaches 3 and it still is, say so before the findings and hand the decision to the owner as one structured choice: merge with the findings listed, amend what is upstream of the change (the plan or the ticket, when the findings keep coming from them), or one more round, saying what changes this time. Agreement between models, or of one model with itself, does not prove the change right: a round with nothing new repeats the last one.

**A finding the user declines with a reason that will still hold next time** (a deliberate trade-off, a convention the lens did not know) is offered for `docs/declined.md`, in the format of `${CLAUDE_PLUGIN_ROOT}/templates/declined.md`, so the next review does not raise it again. A passing reason is not recorded, and a reason that is really an architectural decision is an ADR (`/tm-adr-generate`). Nothing here edits code: persisting the findings and their verdicts is a record of what was reported, not a change to the work.

Once the findings the user chose are fixed, rewrite the ticket's `progress.md` frontmatter for the ticket as it now stands (`unverified`, `failed_deliverables` and `status`, as `/tm-implement` defines them), so `/tm-retro` measures the fixed work and not the work before review. Then the next steps are the optional `/tm-tidy <slug> <fixed point>`, then `/tm-acceptance <slug>` (after the last production change), then `/tm-pr <slug> <fixed point>` for the pull request body.
