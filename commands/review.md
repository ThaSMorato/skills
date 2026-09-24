---
description: Review the diff since a fixed point across six narrow lenses in parallel — quality, tests, security, spec, standards, architecture — then synthesize.
argument-hint: "<fixed point — commit/branch/tag, e.g. main or HEAD~5>"
---

Review the diff between `HEAD` and the fixed point: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## 1. Preflight
If no fixed point was given, ask for one (a commit SHA, branch, tag, or merge-base like `main`). Then confirm it resolves (`git rev-parse`) and the diff is non-empty — a bad ref or an empty diff fails here, not inside six agents.

## 2. Compute the diff once
Write `git diff <fixed-point>...HEAD` (three-dot, vs the merge-base) to a scratch file, and collect the commit list. Every reviewer receives **the path to that file**, not the instruction to compute it — six agents each running the same diff is six times the cost for one result, and the same work done six ways.

## 3. Fan out
Dispatch these agents **in a single message** so they run in parallel. Each is narrow on purpose: a narrow lens can be held to *"every rule, against every changed hunk"*, which is a bar no agent doing five jobs can meet. Give each one the diff path, the fixed point, and the artifacts its own definition names.

| Agent | Lens |
|---|---|
| `review-quality` | code smells and clean-code, together |
| `review-tests` | criteria coverage, seams, determinism, the test DSL |
| `review-security` | CWE-level weaknesses |
| `review-spec` | plan / ticket / FDD — all of it, and only it |
| `review-standards` | the repo's own guidelines, stack guides, ADRs, glossary |
| `review-architecture` | boundary contract, cycles, detail leaking into policy |

Skip `review-architecture` when `docs/boundaries.md` doesn't exist — it would have nothing to judge against — and say that you skipped it.

## 4. Synthesize — this step is not optional
Narrow agents trade precision for recall, and the two costs land here:

- **Duplicates.** A long function is Long Function to the quality lens and a missed convention to the standards lens. Group findings by `file:line`, merge the ones that are the same finding, and keep the clearest naming.
- **Primed findings.** Each agent is looking for its own subject and will produce plausible material on demand. **Drop any finding without a named rule and a concrete failure scenario** — that is the filter, and applying it is most of what this step does.
- **Severity drift.** Each lens believes its own subject matters most. Re-rank across all of them on the shared scale, judging by consequence rather than by which agent reported it.

## 5. Report and persist
Show the merged findings, most-severe first, each with `file:line`, the rule it violates, the failure scenario, the fix, and a `- **Lenses:** <lens>, <lens>` line naming every lens that raised it — merged duplicates keep all their lenses. Then a one-line note per lens saying what it covered — and name any lens that was skipped or that reported having no standard to apply.

Write the same merged list to `.scratch/<feature-slug>/reviews/<NN>-<slug>.md`, with the fixed point, the lenses that ran, and the lenses that were skipped and why:

```markdown
---
kind: review
slug: <NN>-<slug>
fixed_point: <ref>
lenses_run: [quality, tests, security, spec, standards, architecture]
lenses_skipped: [<lens>: <reason>]
findings: <count>
by_severity: {critical: <n>, high: <n>, medium: <n>, low: <n>}
by_lens: {quality: <n>, tests: <n>, security: <n>, spec: <n>, standards: <n>, architecture: <n>}
---
```

The severity keys stay in English whatever language the headings are in. In `by_lens`, a finding raised by two lenses counts once for each, so the lens counts can sum to more than `findings` — that overlap is itself worth seeing. These counts are how `/retro` tells which lens earns its cost on this project, and a lens that is attributed nowhere cannot be judged.

Without the file, a review's findings live only in this conversation and are gone at the next `/compact`. `/retro` reads these across a whole epic to find the finding that **repeats** — and a finding that recurs across tickets is a standard that should move into a stack guide or a rule, which is a conclusion no single review can reach.

The user decides what to fix. Nothing here edits code — persisting the findings is a record of what was reported, not a change to the work.
