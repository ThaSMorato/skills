---
name: implement
description: Execute a validated plan one Step Implementation at a time, test-first (red → green → refactor), run the SI's tests, then STOP and wait before the next SI. Use on "implement / build / execute the plan", "implement SI-N", or after $thasmorato-skills:tm-plan-validate reports clean.
disable-model-invocation: true
user-invocable: false
---

Execute a plan **SI by SI**. The plan is the contract; this skill follows the technical decisions, it does not make them. An SI is done only when its code exists **and** (if it has a Tests section) its tests pass. The next SI never starts until the current one is done and the user says go.

## Input
`$thasmorato-skills:tm-implement <slug> [continuous]` → resolve `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`. If missing, abort: *"No plan at <path>. Run $thasmorato-skills:tm-plan then $thasmorato-skills:tm-plan-validate first."*

Default mode **pauses after every SI** (this is what lets the user `/compact` between steps). Continuous mode (only when the user asks for it upfront: "run all", "autopilot", "don't pause") skips the pause.

## Preflight: before touching code
- **Validation gate:** read the sibling `validation.md`. If it is missing or `status: dirty`, abort: *"Plan is not clean. Run $thasmorato-skills:tm-plan-validate <slug>."* Then compare its `plan_sha256` with `shasum -a 256 plan.md`: a mismatch means the plan changed after it was validated, so abort the same way, naming the change (*"plan.md changed since validation (revision <validated> → <now>)"*). A `validation.md` with no `plan_sha256` predates the check: say so and continue. This gate is non-negotiable.
- **Branch check:** `git status` + current branch. If on the trunk (`main`/`master`/`dev`) or the tree is dirty with unrelated changes, stop and ask the user to set up the branch.
- **Plan sanity:** the plan has Step Implementations, a Dependency Map, and Deliverables. If malformed, stop and report.
- **Up to date with the base:** `git fetch`, then compare with `origin/<base>`. When the base is ahead and its changes touch files with uncommitted work here, put that work aside in **one** named stash of exactly those files, update, and pop it; never a pile of stashes.
- **Dependencies installed:** the installed dependencies match the lockfile (`npm ls` / `pnpm install --frozen-lockfile --offline` dry run, `bundle check`, `pip check`, `go mod verify`, whichever the repo uses). When they do not, stop and ask the owner to install: a test that fails because a package is missing is not a red step.
- **What the owner allows here:** record in `progress.md` under `## Workspace` what this run may do beyond editing files (install packages, start a server or a container, run a migration, reach the network), as the owner said it or the guidelines state it. Anything outside it is asked, once, when it comes up.
- **Baseline:** before the first SI of a fresh run, call the `spawn_agent` tool with `agent_type = "tm-test-runner"`, passing the type check and the test commands the Deliverables name. Record every failure in `progress.md` under `## Baseline` and its count in `baseline_failures`: they were failing before this ticket touched anything. A baseline failure is not this run's to fix, does not spend an SI's attempts and is never blamed on an SI; on resume, the recorded baseline stands.
- **Resume check:** look for the sibling `progress.md`. If present, read `sis_done` / `sis_total` from its frontmatter and which SIs are marked done, and tell the user: *"Found progress: X/Y SIs done. Resuming at SI-Z."* Then read its `## Learned` section: it is what earlier SIs found out about this codebase, and a fresh context after `/compact` has no other way to know it.

## Load references
Read each of these skills, at `references/skills/<name>/index.md`: `tdd` (the red → green → refactor doctrine and seam discipline), `testing` (what to test, at which seam, and how to keep tests clean), `code-smells` and `clean-code` (the refactor checklist).

Then load the **project's own guides**, resolved deterministically rather than remembered: read `docs/guidelines.md`'s routing table and load every guide whose file patterns match the files this SI touches: the stack guides (`.claude/skills/<tech>-guide/`) and `testing-guide-<project>` if the repo ships one. Those are additive: they specialize the generic skills, they never replace this loop. Load only what the current SI needs.

## Structural tickets
If the plan's `type` is `structural`, the loop changes shape: there is no red step, because no behavior is being added. **Existing tests are not modified**, and they must stay green after every SI. Refactor production code freely; changing a test to accommodate a structural change means the change was not structural, and that is a stop-and-report, not something to work around.

## Task list + progress file
Before the first SI, create one task per SI (in Dependency-Map order) so the user sees the whole plan. Then create `progress.md` (all SIs `pending`) with **every frontmatter field below filled from SI-1**, or, on resume, mark already-done SIs complete. `$thasmorato-skills:tm-retro` sums these fields and never reads a count out of prose, so a field left out is a "not measured" cell in every retro: rewrite the frontmatter at every close-out (each SI, the final verification, and the close-out of `$thasmorato-skills:tm-review`'s fixes).

```markdown
---
kind: progress
plugin_version: 0.7.0
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
codex_thread: <the Codex thread id, to resume with `codex resume`; omit when the harness is claude-code>
slug: <NN>-<slug>
status: in_progress | completed
sis_done: <X>
sis_total: <Y>
escalations: <count, see step 5 and Final verification>
unverified: <count, see Final verification>
failed_deliverables: <count of Deliverables commands that failed on their first run in Final verification, fixed or not>
baseline_failures: <count of failures recorded under Baseline, before the first SI>
---

# Progress: <NN> <Ticket title>

## Workspace
- <what the owner allows this run beyond editing files: install, server, container, migration, network>

## Baseline
- <each failure before the first SI: the test or `file:line`, one line; or `none`>

### SI-N: <name>
- **Status:** done | pending | escalated
- **Tests:** <result, or "no tests">
- **Deviation:** <a small adaptation the plan did not spell out: a name, a path, a compatible type; `none` when there was none>
- **Notes:** <out-of-scope observations, or "none">

## Learned
- SI-N: <one line: a fact about this codebase that the next SI would otherwise rediscover>

## Not verified
- <written at Final verification>
```

**Keep this frontmatter exactly as shown**, integers included (`unverified` starts at `0`). `$thasmorato-skills:tm-flow` reads `sis_done`/`sis_total` to place the ticket in its matrix, and `$thasmorato-skills:tm-retro` sums them across an epic; a count written into the body, under another key, or as `5/5` is a count neither of them can read. Update the frontmatter in the same edit that marks an SI.

## The per-SI loop
Run SIs in Dependency-Map order. Never skip ahead; never run two SIs in one pass. For each **pending** SI:

**The SI ends at step 6.** A status message is not an end: until the SI is recorded and its tests pass, keep working through the steps in this turn. And keep the diff to what the SI asks: a point fix changes the lines it fixes, not the module around them. No new abstraction, option or layer the SI does not name; the refactor step cleans what this SI touched, nothing wider.

1. **Read only this SI** (Description, Technical actions, Tests, Mirror, Dependencies, Acceptance criteria). If it has a `Mirror:`, open those lines before writing anything: the new code should read like them. Keep a short checklist in working memory: one item per technical action, one per test file, plus "run tests".
2. **Red**: write the failing test(s) first, at the seam(s) the SI names. Each test verifies real behavior through the public interface; expected values come from an independent source, never recomputed the way the code does. Run them; watch them fail for the right reason.
3. **Green**: write the minimum code to pass. No speculative features.
4. **Refactor: production _and_ tests.** With tests green, clean both:
   - *Production:* run the `code-smells` checklist; leave it cleaner than you found it.
   - *Tests:* they are first-class code and the low-level documentation of this behavior; refactor them too. Enforce F.I.R.S.T. and the single-act rule (one Act per test), and grow the **test DSL** (builders / mother objects, custom matchers, composed results) so each test reads like a spec. Never weaken a test to make it pass.
   - *Docs:* fix, in this SI, every comment, docstring, README line and living-doc line (an FDD contract or rule, a glossary entry) that cites a symbol this SI renamed, removed or changed, and every list a new enum member belongs to; the plan's Deliverables name the ones found up front. When the SI had to depart from the node map (a node, an interface), amend the map file and the docs it touches in this same step, and say so in the SI report: a map left behind tells `$thasmorato-skills:tm-review` to check the wrong contract.
5. **Run this SI's tests only** (not the full suite), **plus the type checker** when the repo has one (`tsc --noEmit`, `mypy`, `go vet`, …), through the test runner: call the `spawn_agent` tool with `agent_type = "tm-test-runner"`, passing the exact commands and the baseline, and read its summary, not the log. A failure it marks `already failing` belongs to the baseline. A type error left for the final verification is found five SIs later, far from the change that caused it; lint and build stay at the end. On a new failure, enter the fix loop: read the error, fix the root cause, re-run, at most **3 times**. A probe the diagnosis calls for (a log line, a query, printing a value) is not an attempt, as long as the owner's workspace allows it; only a change meant to fix counts. **From the second failed attempt on, read `references/skills/diagnose/index.md` and follow it** and work by its method: each attempt names the hypothesis it tests and its kind (code, environment/data, measurement), and three in a row of the same kind stop the loop. The SI's red test is sealed while you fix: changing it to pass is moving the ruler. Do not retry blindly, do not swallow errors, do not add skips. If the failure is in a *previous* SI's code, stop and escalate rather than editing completed work. After 3 failed attempts, stop and report in the `diagnose` output's shape: the observation, the hypotheses with their kind and evidence, what each attempt tested, and the critical unknown with the probe that would settle it. **Classify the block**: `doc` (the plan, the map or the FDD is wrong or silent), `SI` (the code of this SI), or `environment` (a service, a dependency, data, a tool). A failure of a tool or an MCP server names which one and what it returned. Either stop is an **escalation**: mark the SI `escalated`, add 1 to `escalations`, and write the report into its Notes; the count is the only durable record of where the loop got stuck.
6. **Record + STOP.** Mark the task and `progress.md` entry `done` (with test result and any out-of-scope notes). An adaptation small enough not to change the design (a name, a path, a compatible type) goes on the SI's `Deviation:` line, where `review-spec` reads it; one that changes a node, an interface or the slicing is not a deviation: stop and send the owner back to `$thasmorato-skills:tm-plan`. If this SI taught you something about the codebase that the next SI would otherwise rediscover (the command that actually runs the tests, a fixture that must be reset, a module that looks unused and is not, a convention the stack guide does not state), add one line under `## Learned`, tagged with the SI. Facts about this repo only: nothing generic, nothing about this SI's own logic. Then:
   - **Default mode:** emit a one-line SI report, then the text for a compaction, one line: `/compact keep: <slug>, SI-N+1 next, <what the next SI needs from this one>; drop: <the logs, the explorations, the dead ends of this SI>`. End with exactly: **"SI-N done. Run `$thasmorato-skills:tm-implement <slug>` to continue with SI-N+1 (or /compact first if context is large)."** Then STOP: no further tool calls. Resuming re-reads `progress.md` and picks up at the next pending SI.
   - **Continuous mode:** emit the SI report and go straight to the next SI's step 1.

Treat the stop as a terminator, not a rhetorical question; starting the next SI without approval is this skill's most common failure.

## Final verification: after the last SI
Run the plan's **Deliverables** checklist through the test runner (call the `spawn_agent` tool with `agent_type = "tm-test-runner"`): the full test suite and every test file the plan names, then type-check, lint, and build (whichever the repo has). Count every command that fails on its first run into `failed_deliverables`, whether you then fix it or not; a failure the runner marks `already failing` is the baseline's, reported apart and never counted. Apply the same 3-attempt fix discipline, shared across all failing checks; hitting the limit here is an escalation too. After a fix, rerun only the files edited since their last green run, then the whole set once at the end. **A test that is green only on the rerun** (red in the first run, green in the next with nothing changed) goes through `references/skills/diagnose/index.md`, like a test green only alone.

**Build smoke test:** when the repo builds an artifact (a `dist/`, a bundle, a binary, an image), run the built thing once: start it, import its entry, or call its CLI with `--help`, and check that the files it needs at runtime (assets, templates, migrations, non-code files) are inside the build. A type check passes on `src/`; what ships is `dist/`, and a missing asset is found only by running it. No build step: say so in the report.

Then write `## Not verified`: every acceptance criterion or deliverable that **no command in this run actually checked**. Examples: a UI behavior with no E2E tool in the repo, a migration never run against a real database, an integration exercised only through a fake, a performance claim with no measurement. One line each, with what would verify it. Set `unverified` to their count (`0`, and the section says `none`, when everything was checked). Claiming done for what was never run is the failure this section prevents; a short honest list is worth more than a clean-looking report.

**A suite that is only green when its tests run alone is not green.** A test that fails or times out in the full run and passes on its own is a defect (shared state, a leak, a missing setup, a slow path in the code), and it stops the run: read `references/skills/diagnose/index.md` and follow it. Rerunning, blaming machine load, or skipping the hook are not options to offer before the cause is found.

Then set `status: completed` (the only finished value) in `progress.md`'s frontmatter and report the results, the **Not verified** list, and the aggregated out-of-scope notes as follow-ups. A UI behavior in the **Not verified** list is open work, not a footnote: the report says the ticket is not done until `$thasmorato-skills:tm-acceptance` has checked it. Version control (commit/PR) is the user's call; hand back to `$thasmorato-skills:tm-review` first.

## Rules
- **Waiting has a deadline.** A wait on something outside the run (a server starting, a container, a long job) states how long it waits and what it does when the time is up; an open wait is a stalled run.
- **A message from the owner mid-run gets a one-line answer first**, then the work goes on or stops as the message says. Running on as if nothing was said is the failure.
- The plan is the contract: don't add, drop, or reshape SIs mid-run. If it's wrong, stop and send the user back to `$thasmorato-skills:tm-plan`.
- One SI at a time, in dependency order. SI tests during the loop; full suite only at the end.
- Stay in the current SI's scope: note unrelated issues, don't act on them.
- Never weaken tests, never bypass hooks, never swallow errors.
- **Never suppress a check to get green.** No new `eslint-disable`, `@ts-ignore` / `@ts-expect-error`, `# noqa`, `# type: ignore`, `rubocop:disable`, `//nolint`, skipped or focused tests. A suppression added to pass is the same bypass as a weakened test. When one is genuinely right (a false positive, a generated file), stop, say why, and add it only on the user's OK, with the reason in the SI's Notes.
