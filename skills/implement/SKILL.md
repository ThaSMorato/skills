---
name: implement
description: Execute a validated plan one Step Implementation at a time, test-first (red → green → refactor), run the SI's tests, then STOP and wait before the next SI. Use on "implement / build / execute the plan", "implement SI-N", or after /plan-validate reports clean.
disable-model-invocation: true
---

Execute a plan **SI by SI**. The plan is the contract; this skill follows the technical decisions, it does not make them. An SI is done only when its code exists **and** (if it has a Tests section) its tests pass. The next SI never starts until the current one is done and the user says go.

## Input
`/implement <slug> [continuous]` → resolve `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`. If missing, abort: *"No plan at <path>. Run /plan then /plan-validate first."*

Default mode **pauses after every SI** (this is what lets the user `/compact` between steps). Continuous mode (only when the user asks for it upfront: "run all", "autopilot", "don't pause") skips the pause.

## Preflight: before touching code
- **Validation gate:** read the sibling `validation.md`. If it is missing or `status: dirty`, abort: *"Plan is not clean. Run /plan-validate <slug>."* This gate is non-negotiable.
- **Branch check:** `git status` + current branch. If on the trunk (`main`/`master`/`dev`) or the tree is dirty with unrelated changes, stop and ask the user to set up the branch.
- **Plan sanity:** the plan has Step Implementations, a Dependency Map, and Deliverables. If malformed, stop and report.
- **Resume check:** look for the sibling `progress.md`. If present, read `sis_done` / `sis_total` from its frontmatter and which SIs are marked done, and tell the user: *"Found progress: X/Y SIs done. Resuming at SI-Z."* Then read its `## Learned` section: it is what earlier SIs found out about this codebase, and a fresh context after `/compact` has no other way to know it.

## Load references
Call the Skill tool with each of: `tdd` (the red → green → refactor doctrine and seam discipline), `testing` (what to test, at which seam, and how to keep tests clean), `code-smells` and `clean-code` (the refactor checklist).

Then load the **project's own guides**, resolved deterministically rather than remembered: read `docs/guidelines.md`'s routing table and load every guide whose file patterns match the files this SI touches: the stack guides (`.claude/skills/<tech>-guide/`) and `testing-guide-<project>` if the repo ships one. Those are additive: they specialize the generic skills, they never replace this loop. Load only what the current SI needs.

## Structural tickets
If the plan's `type` is `structural`, the loop changes shape: there is no red step, because no behavior is being added. **Existing tests are not modified**, and they must stay green after every SI. Refactor production code freely; changing a test to accommodate a structural change means the change was not structural, and that is a stop-and-report, not something to work around.

## Task list + progress file
Before the first SI, create one task per SI (in Dependency-Map order) so the user sees the whole plan. Then create `progress.md` (all SIs `pending`) or, on resume, mark already-done SIs complete.

```markdown
---
kind: progress
plugin_version: <the "version" in ${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json>
slug: <NN>-<slug>
status: in_progress | completed
sis_done: <X>
sis_total: <Y>
escalations: <count, see step 5 and Final verification>
unverified: <count, see Final verification>
---

# Progress: <NN> <Ticket title>

### SI-N: <name>
- **Status:** done | pending | escalated
- **Tests:** <result, or "no tests">
- **Notes:** <out-of-scope observations, or "none">

## Learned
- SI-N: <one line: a fact about this codebase that the next SI would otherwise rediscover>

## Not verified
- <written at Final verification>
```

**Keep this frontmatter exactly as shown**, integers included (`unverified` starts at `0`). `/flow` reads `sis_done`/`sis_total` to place the ticket in its matrix, and `/retro` sums them across an epic; a count written into the body, under another key, or as `5/5` is a count neither of them can read. Update the frontmatter in the same edit that marks an SI.

## The per-SI loop
Run SIs in Dependency-Map order. Never skip ahead; never run two SIs in one pass. For each **pending** SI:

1. **Read only this SI** (Description, Technical actions, Tests, Mirror, Dependencies, Acceptance criteria). If it has a `Mirror:`, open those lines before writing anything: the new code should read like them. Keep a short checklist in working memory: one item per technical action, one per test file, plus "run tests".
2. **Red**: write the failing test(s) first, at the seam(s) the SI names. Each test verifies real behavior through the public interface; expected values come from an independent source, never recomputed the way the code does. Run them; watch them fail for the right reason.
3. **Green**: write the minimum code to pass. No speculative features.
4. **Refactor: production _and_ tests.** With tests green, clean both:
   - *Production:* run the `code-smells` checklist; leave it cleaner than you found it.
   - *Tests:* they are first-class code and the low-level documentation of this behavior; refactor them too. Enforce F.I.R.S.T. and the single-act rule (one Act per test), and grow the **test DSL** (builders / mother objects, custom matchers, composed results) so each test reads like a spec. Never weaken a test to make it pass.
5. **Run this SI's tests only** (not the full suite), **plus the type checker** when the repo has one (`tsc --noEmit`, `mypy`, `go vet`, …). A type error left for the final verification is found five SIs later, far from the change that caused it; lint and build stay at the end. On failure, enter the fix loop: read the error, fix the root cause, re-run, at most **3 times**. **From the second failed attempt on, call the Skill tool with `diagnose`** and work by its method: each attempt names the hypothesis it tests and its kind (code, environment/data, measurement), and three in a row of the same kind stop the loop. The SI's red test is sealed while you fix: changing it to pass is moving the ruler. Do not retry blindly, do not swallow errors, do not add skips. If the failure is in a *previous* SI's code, stop and escalate rather than editing completed work. After 3 failed attempts, stop and report in the `diagnose` output's shape: the observation, the hypotheses with their kind and evidence, what each attempt tested, and the critical unknown with the probe that would settle it. Either stop is an **escalation**: mark the SI `escalated`, add 1 to `escalations`, and write the report into its Notes; the count is the only durable record of where the loop got stuck.
6. **Record + STOP.** Mark the task and `progress.md` entry `done` (with test result and any out-of-scope notes). If this SI taught you something about the codebase that the next SI would otherwise rediscover (the command that actually runs the tests, a fixture that must be reset, a module that looks unused and is not, a convention the stack guide does not state), add one line under `## Learned`, tagged with the SI. Facts about this repo only: nothing generic, nothing about this SI's own logic. Then:
   - **Default mode:** emit a one-line SI report and end with exactly: **"SI-N done. Run `/implement <slug>` to continue with SI-N+1 (or /compact first if context is large)."** Then STOP: no further tool calls. Resuming re-reads `progress.md` and picks up at the next pending SI.
   - **Continuous mode:** emit the SI report and go straight to the next SI's step 1.

Treat the stop as a terminator, not a rhetorical question; starting the next SI without approval is this skill's most common failure.

## Final verification: after the last SI
Run the plan's **Deliverables** checklist: the full test suite, then type-check, lint, and build (whichever the repo has). Apply the same 3-attempt fix discipline, shared across all failing checks; hitting the limit here is an escalation too.

Then write `## Not verified`: every acceptance criterion or deliverable that **no command in this run actually checked**. Examples: a UI behavior with no E2E tool in the repo, a migration never run against a real database, an integration exercised only through a fake, a performance claim with no measurement. One line each, with what would verify it. Set `unverified` to their count (`0`, and the section says `none`, when everything was checked). Claiming done for what was never run is the failure this section prevents; a short honest list is worth more than a clean-looking report.

**A suite that is only green when its tests run alone is not green.** A test that fails or times out in the full run and passes on its own is a defect (shared state, a leak, a missing setup, a slow path in the code), and it stops the run: call the Skill tool with `diagnose`. Rerunning, blaming machine load, or skipping the hook are not options to offer before the cause is found.

Then set `status: completed` in `progress.md`'s frontmatter and report the results, the **Not verified** list, and the aggregated out-of-scope notes as follow-ups. A UI behavior in the **Not verified** list is open work, not a footnote: the report says the ticket is not done until `/acceptance` has checked it. Version control (commit/PR) is the user's call; hand back to `/review` first.

## Rules
- The plan is the contract: don't add, drop, or reshape SIs mid-run. If it's wrong, stop and send the user back to `/plan`.
- One SI at a time, in dependency order. SI tests during the loop; full suite only at the end.
- Stay in the current SI's scope: note unrelated issues, don't act on them.
- Never weaken tests, never bypass hooks, never swallow errors.
- **Never suppress a check to get green.** No new `eslint-disable`, `@ts-ignore` / `@ts-expect-error`, `# noqa`, `# type: ignore`, `rubocop:disable`, `//nolint`, skipped or focused tests. A suppression added to pass is the same bypass as a weakened test. When one is genuinely right (a false positive, a generated file), stop, say why, and add it only on the user's OK, with the reason in the SI's Notes.
