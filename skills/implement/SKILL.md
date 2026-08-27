---
name: implement
description: Execute a validated plan one Step Implementation at a time — test-first (red → green → refactor), run the SI's tests, then STOP and wait before the next SI. Use on "implement / build / execute the plan", "implement SI-N", or after /plan-validate reports clean.
disable-model-invocation: true
---

Execute a plan **SI by SI**. The plan is the contract — this skill follows the technical decisions, it does not make them. An SI is done only when its code exists **and** (if it has a Tests section) its tests pass. The next SI never starts until the current one is done and the user says go.

## Input
`/implement <slug> [continuous]` → resolve `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`. If missing, abort: *"No plan at <path>. Run /plan then /plan-validate first."*

Default mode **pauses after every SI** (this is what lets the user `/compact` between steps). Continuous mode — only when the user asks for it upfront ("run all", "autopilot", "don't pause") — skips the pause.

## Preflight — before touching code
- **Validation gate:** read the sibling `validation.md`. If it is missing or `status: dirty`, abort: *"Plan is not clean. Run /plan-validate <slug>."* This gate is non-negotiable.
- **Branch check:** `git status` + current branch. If on the trunk (`main`/`master`/`dev`) or the tree is dirty with unrelated changes, stop and ask the user to set up the branch.
- **Plan sanity:** the plan has Step Implementations, a Dependency Map, and Deliverables. If malformed, stop and report.
- **Resume check:** look for the sibling `progress.md`. If present, read which SIs are already done and tell the user: *"Found progress: X/Y SIs done. Resuming at SI-Z."*

## Load references
Load the `tdd` skill (the red → green → refactor doctrine and seam discipline), the `testing` skill (what to test, at which seam, and how to keep tests clean), and the `code-smells` + `clean-code` skills (the refactor checklist). If the repo ships a `testing-guide-<project>` skill, load that too for project-specific recipes. Load only what the current SIs need.

## Task list + progress file
Before the first SI, create one task per SI (in Dependency-Map order) so the user sees the whole plan. Then create `progress.md` (all SIs `pending`) — or, on resume, mark already-done SIs complete.

```markdown
# Progress — <NN> <Ticket title>
**Status:** in_progress | completed
**SIs:** X/Y done

### SI-N — <name>
- **Status:** done | pending
- **Tests:** <result, or "no tests">
- **Notes:** <out-of-scope observations, or "none">
```

## The per-SI loop
Run SIs in Dependency-Map order. Never skip ahead; never run two SIs in one pass. For each **pending** SI:

1. **Read only this SI** (Description, Technical actions, Tests, Dependencies, Acceptance criteria). Keep a short checklist in working memory: one item per technical action, one per test file, plus "run tests".
2. **Red** — write the failing test(s) first, at the seam(s) the SI names. Each test verifies real behavior through the public interface; expected values come from an independent source, never recomputed the way the code does. Run them; watch them fail for the right reason.
3. **Green** — write the minimum code to pass. No speculative features.
4. **Refactor — production _and_ tests.** With tests green, clean both:
   - *Production:* run the `code-smells` checklist; leave it cleaner than you found it.
   - *Tests:* they are first-class code and the low-level documentation of this behavior — refactor them too. Enforce F.I.R.S.T., the single-act rule (one Act per test), and factor repetition into a small test DSL / mother objects so each test reads like a spec. Never weaken a test to make it pass.
5. **Run this SI's tests only** (not the full suite). On failure, enter the fix loop: read the error, fix the root cause, re-run — at most **3 times**. Do not retry blindly, do not swallow errors, do not add skips. If the failure is in a *previous* SI's code, stop and escalate rather than editing completed work. After 3 failed attempts, stop and report (which SI, the failure, your hypothesis, what you tried).
6. **Record + STOP.** Mark the task and `progress.md` entry `done` (with test result and any out-of-scope notes). Then:
   - **Default mode:** emit a one-line SI report and end with exactly: **"SI-N done. Run `/implement <slug>` to continue with SI-N+1 (or /compact first if context is large)."** Then STOP — no further tool calls. Resuming re-reads `progress.md` and picks up at the next pending SI.
   - **Continuous mode:** emit the SI report and go straight to the next SI's step 1.

Treat the stop as a terminator, not a rhetorical question — starting the next SI without approval is this skill's most common failure.

## Final verification — after the last SI
Run the plan's **Deliverables** checklist: the full test suite, then type-check, lint, and build (whichever the repo has). Apply the same 3-attempt fix discipline, shared across all failing checks. Then mark `progress.md` `Status: completed` and report the results plus the aggregated out-of-scope notes as follow-ups. Version control (commit/PR) is the user's call — hand back to `/review` first.

## Rules
- The plan is the contract: don't add, drop, or reshape SIs mid-run. If it's wrong, stop and send the user back to `/plan`.
- One SI at a time, in dependency order. SI tests during the loop; full suite only at the end.
- Stay in the current SI's scope — note unrelated issues, don't act on them.
- Never weaken tests, never bypass hooks, never swallow errors.
