# Changelog

## 0.6.0

Seventeen epics, landed one per PR (#29 to #45) onto a single v0.6 branch, from a second
reading of the suite's main model, `mattpocock/skills`, 212 commits after the July
baseline. Everything taken was rewritten inside the suite; nothing points outside it.
New stages: `/guardrails`, `/pr`, `/walkthrough`, `/prototype`, `/questionnaire`, `/teach`,
`/wait-what`, `/handoff`, `/writing-fragments`, `/writing-beats`, `/writing-shape`, `/flow-report`.
New reference skill: `visuals`. Seven new test files (44 to 81 tests).

### Writing for agents (epic 1)
- `skill-anatomy` gains: a completion criterion on every step (clarity and demand), write
  the positive, the no-op test, the environment as source of truth, one trigger per branch,
  disclose by branch and co-locate, leading words, typography, and an **Invocation** section
  (context load against cognitive load).
- Skills and agents are reached by naming the tool: "Call the Skill tool with `x`", "Call
  the Agent tool with `x`", across every skill, agent and command.
  `scripts/skill-invocation.test.mjs` fails on a softer phrasing, an unknown name, or an
  agent that calls the Skill tool without having it.

### `/diagnose`, tighter (epic 2)
- Secrets are redacted in everything shown. Step 1 ends on **one command, already run, red
  on the owner's exact symptom**, deterministic, fast and unattended; intermittent bugs
  raise the reproduction rate; a human-only step uses `hitl-loop.template.sh`.
- Hypotheses state a prediction and are shown ranked; debug logs carry a unique prefix;
  performance regressions are measured against a baseline; a level with no seam that
  carries the bug is a **seam gap** (an architecture finding); a cleanup step; the
  hypothesis that held goes in the commit.
- `plan` and `plan-validate` re-run the diagnosis `loop` in final verification.

### `/retro` reads the environment, on two tracks (epic 3)
- `retro/environment.md`: tactical cost and strategic change for each finding; navigation,
  automated checks, guardrail, coding standards, steering files, tool economy, information
  access. A **mechanical** standard becomes a check (lint, hook, CI), a **judgement** one a
  line the review reads. A repo with no guardrail is a finding.
- `/session-analyze` reports environment signals from tool-call names.

### `/guardrails` (epic 4)
- Inventories the repo's own check commands, hook manager, CI and Claude Code hooks;
  proposes only what is missing; installs; **proves each item fires both ways**; writes
  `docs/guardrails.md`.
- `git-guard.sh`: a PreToolUse hook that blocks destructive git commands, ignores quoted
  text, and works with jq, python3, node, or only bash and sed (20 tests).

### Interview rounds, `/questionnaire`, gates as briefs (epic 5)
- The interview asks the **frontier** of open decisions in numbered rounds, each with its aim
  and a recommendation; facts are found, never asked.
- `asking`: rounds as the general rule; a gate is a brief, pushed as late as possible.
- `/questionnaire` writes questions for someone outside the conversation and folds the
  answers back as `Decided` markers.

### Visual reporting (epic 6)
- New reference skill `visuals`: the smallest view (pseudocode, call/component/file tree,
  Mermaid, diff sketch), gains in project terms, a strength per proposal (Strong, Worth
  exploring, Speculative), and a self-contained HTML report with before/after cards.
- Offered by `/tidy <path>` and `/analyze`; `/tidy` and `/trim` rate every proposal.

### `/pr` (epic 7)
- The PR body from the artifacts: a summary drawn as the smallest view, before/after
  evidence (and everything not verified), and the merge danger (one-way or two-way door,
  blast radius). Opens the PR only when asked.

### Deep modules (epic 8)
- `architecture/rules/deep-modules.md`: module, interface, depth, seam, adapter, leverage,
  locality; the deletion test; one adapter is a hypothetical seam, two make it real; the
  interface is the test surface. Used by `/trim` (footprint), `tdd` and `visuals`.

### Declined proposals are remembered (epic 9)
- `docs/declined.md` (append-only): a proposal the owner turned down for a lasting reason
  is not proposed again by `/tidy`, `/trim` or any review lens until its "revisit when"
  happens.
- `scripts/references.test.mjs`: every `${CLAUDE_PLUGIN_ROOT}` path exists and every
  template is indexed (five were not).

### `/prototype` (epic 10)
- One design question answered with throwaway code: a clickable HTML demo of a state model,
  or structurally different UI variants on the real page. The answer becomes a `Decided`
  marker; the code never merges.

### Grounding (epic 11)
- `doc-validate/grounding.md`: no concept is used before the reader has it. The PRD, HLD and
  FDD writers follow it, and `/doc-validate` reports `UG-N`.

### `/teach` (epic 12)
- A teaching workspace (mission, trusted sources, learning records, glossary) and short
  HTML lessons with recall practice, in the zone of proximal development.

### `/walkthrough` (epic 13)
- Before a change merges, an HTML lesson over its diff with a recall quiz; what stays
  unclear after a re-explanation is a finding about the code. `/retro` sums the results.

### `/wait-what` and `/handoff` (epic 14)
- Re-pitch the last answer in simplified technical English; write what only the
  conversation knows into a handoff for a fresh session.

### Writing (epic 15)
- `/writing-fragments` (explore), `/writing-beats` and `/writing-shape` (exploit), the last
  two on the same grounding rule.
- **Fix:** `/guardrails`, `/pr` and `/walkthrough` had an unquoted `: ` in their description,
  so a strict YAML parser did not load them. `scripts/frontmatter.test.mjs` now checks
  every skill, command and agent.

### The flow reports on itself (epic 17)
- **`/session-analyze` owns the environment lens** (navigation, tool economy, missing
  information, instructions that did not hold): the conversation is where they show.
  `/retro` keeps only what its artifacts prove (the guardrail, mechanical standards the review
  kept catching) and cites the meta-retros for the rest.
- **Every measured artifact records `plugin_version`** (node map, plan, progress, the three
  validations, review, trim, tidy, diagnosis, walkthrough, meta-retro);
  `scripts/plugin-version.test.mjs` keeps it so. `/retro` measures per version.
- **`/retro` tags every process change `flow` or `project`**, as `/session-analyze` already did,
  and gains frontmatter (`kind: retro`, `plugin_versions`, finding counts).
- **New `/flow-report`**: reads several projects' retros and meta-retros, groups the `flow`
  findings by the plugin file they would change (repeated across projects first), and puts
  the flow measurements side by side per plugin version: the input for the next version.
- `/retro`'s negative rules rewritten in the positive.

### No em dash (epic 16)
- 1,378 em dashes became a comma, colon, semicolon, parentheses or full stop by meaning.
  The separator inside a marker with a value (`> Decided: <value> — <who>, <date>`) stays.
  `scripts/no-em-dash.test.mjs` keeps it that way.

### Coarse slicing, and the owner's slicing stays decided (epic 18)
From the first session retros run on 0.5.0 (three repositories): the owner merged the
proposed SIs 16 times, and `/plan-validate` re-flagged the merge.
- `/plan` starts coarse: SIs on the same file, function, node or screen, verified by the
  same check, or with a single consumer are merged before presenting; 1 to 3 SIs at small
  gear; every SI changes production code. The coarsest slicing is the recommended answer,
  and combinable merges are a multi-select.
- The approved slicing is recorded in the plan's `## Slicing` as a `> Decided:` marker.
  `/plan-validate` writes what `SZ` and `DS` would say against it under `## Notes`, without
  blocking; `DS` does not run at small gear.
- A clean plan revised after the owner's approval shows what changed before the hand-off,
  and inside `/flow` starting `/implement` is asked, with "stop here" as an option.

## 0.5.0

Eleven epics, landed one per PR (#17–#28) onto a single v0.5 branch. The owner's
global `~/.claude` was emptied: collections gathered from other skill repos were
archived, and this plugin is now the only suite loaded, so what it does not cover,
nothing covers. Each epic absorbs something those collections did better, rewritten
inside the suite. New stages: `/diagnose`. New lenses: `review-docs`, `review-ui`. New
agent: `pattern-scout`. New reference skill: `ui`. New ticket type: `bugfix`.

### Review lenses for contracts, docs and UI (epic 3B)

The seven lenses were all written for server code, and none of them read the
documentation or asked whether a published contract still held.

- **Contract compatibility**, a new `architecture` rule read by `review-architecture`: a
  published API, event, public interface or CLI changes only compatibly — removals and
  renames, type changes, new required inputs, error shapes and observable behavior (Hyrum's
  Law) break consumers. The fix is expand / migrate / contract, and the removal ticket
  carries an AC of **zero remaining consumers** with its evidence (`/tickets`). This check
  runs even without `docs/boundaries.md`.
- **New `review-docs` lens**: documentation the diff made false — a README step, a required
  env var missing from `.env.example`, a removed flag, a described default. Every finding
  cites the doc line and the code line. The flow's own design docs stay with `review-spec`.
- **New `ui` reference skill** (keyboard access, focus management, accessible names,
  contrast, loading / empty / error states, layout shift and slow interactions) and a
  **conditional `review-ui` lens**, dispatched only when the diff touches UI code and
  recorded in `lenses_skipped` otherwise. It checks what the component library already
  provides before flagging, and for shift and latency flags the pattern and says how to
  measure.
- `lenses_run` and `by_lens` gain `docs` and `ui`, so the retro measures both.

### The interview aims, counts convergence, and challenges once (epic 6)

The interview's gate said when to stop (every required section filled), not where to aim
next or whether the conversation was converging.

- **Every question names the weakest required section** of the brief it targets, and why.
- **Convergence is counted in the glossary**: each answer reports how many `CONTEXT.md`
  terms it created and renamed. Two answers in a row that change no load-bearing term,
  plus the gate, is the signal. No weighted "ambiguity score": that would be a number the
  model judges, dressed as a measurement.
- **Two challenges, once each**: the Contrarian (*what if the opposite were true?*) once
  the problem and goals are drafted, and the Simplifier (*the smallest version worth
  having*) before scope, which feeds the gear. Two answers that move no section trigger
  the ontological question (*what is this, really?*). Recorded in a new **Assumptions
  challenged** table.
- **Early exit is recorded**: `Status: early-exit`, the gaps in Open questions, and the
  `prd-writer` turns them into `> Needs Input:` instead of filling them.

### Debt the reviews saw, gathered (epic 9)

Technical debt was detected in four places and gathered in none. The clearest case: a
review finding the verifier marks `pre-existing` is real, but in code the diff did not
change, so nobody owns it and it vanishes after the review.

- **`/retro` collects the `pre-existing` findings** across the scope, groups them by
  component (or directory), and calls an area a **hotspot** when two or more tickets ran
  into it. It proposes **at most 3 structural tickets**, ranked by benefit (severity ×
  tickets that hit it) against cost (what the fix touches), each citing the findings it
  closes; the rest are listed. The owner decides; nothing is created.
- `templates/retro.md` gets a **Debt hotspots** section and a pre-existing count in
  Measurements.

### A stage for bugs — `/diagnose` (epic 1)

The flow had no stage, gear or ticket type for a bug. A bug of unknown cause fell into
the Direct gear, and the `/implement` fix loop capped attempts at three without any
method, so the three were often spent on one guess.

- **New `diagnose` skill and `/diagnose` command.** Reproduce and write down what is seen
  before any theory; name **three hypotheses of different kinds** (the code, the
  environment or data, the measurement itself); weigh evidence for and against by
  strength, from a failing test down to intuition; try to refute the leader; run **one
  discriminating probe** at a time (`git bisect` included); reduce. It ends with the cause
  at `file:line` and the pinned and flipped tests at every level the bug crosses, with the
  expected behavior taken from the spec, not from the intended fix. It does not fix.
- **Sealed tests.** Once written and seen failing, the flipped tests are not edited until
  the fix is green; correcting a wrong test is a separate step with its reason.
- **`Type: bugfix`** on tickets and plans. Its Source is a diagnosis with
  `status: cause-found`; its first SI writes the pinned and flipped tests per level.
  `plan-validate` checks the diagnosis, every level (`UT`), and that no SI edits a flipped
  test (`IC`).
- **`/implement` uses the method from the second failed attempt**: each attempt names its
  hypothesis and kind, three in a row of the same kind stop the loop, and the escalation
  report takes the diagnosis's shape.
- The retro reports bugs: bugfix tickets by gear, diagnoses found vs unresolved.
- `/flow`: a bug of unknown cause starts at `/diagnose`, never at a fix.

### `/analyze` checks what it delivered (epic 7)

- **The fan-out is checked on disk.** After the per-component deep dives, `/analyze`
  compares the components chosen with the files written, re-dispatches the missing ones
  once, and lists what is still missing, with the components not analyzed by choice and
  every `coverage: partial`. An agent that failed used to leave a silent gap.
- **New `templates/component-analysis.md`**, which the `component-analyzer` fills
  (it had no template). Business rules carry a **confidence**: `explicit` in code,
  `tested` by a cited test, or `inferred`; a FDD built on an inferred rule knows to
  confirm it. Plus exposed contracts, the tests that exercise the component wherever
  they live (and the contract each fake assumes), and countable frontmatter.
- **`dependency-auditor` measures blast radius**: for each item to act on or plan, how
  many files import it and whether one adapter encapsulates it or the use is spread —
  which decides between a one-adapter change and an expand / migrate / contract sequence.

### Altitude in `/tidy`, and `/tidy` on a path (epic 8)

- **New smell `mixed-altitude`**: a body that interleaves intent, domain calls and raw
  mechanics. Tag each line by band; extract a mechanics block into a leaf named for what
  it does — and never extract lines already at the caller's altitude (that is a lazy
  layer, not a fix). `clean-code`'s Stepdown line points at it.
- **`/tidy` reads with it.** Rule 2 walks each function in scope with the altitude lens;
  rule 3 collapses the whole duplicated unit, not the easy half, and the two are separate
  checks; rule 4 removes guards an extraction left dead. A touched function is read whole.
- **An extracted helper is re-read** under rules 2 and 3 before the suite runs; a helper
  that is itself mixed moves the mess down a level.
- **"Why it is structural" names four checks**: order, errors and side effects,
  observability (logs, metrics, spans), type breadth.
- **`/tidy <path>`**: existing code with no ticket, when tests cover it. The covering tests
  are named and run green first; code with none cannot be tidied. Output goes to
  `.scratch/standalone/tidy/`. `/flow`'s Direct gear points at it for a cleanup.
- The `tidy` description no longer summarizes its workflow (epic 10's anatomy rule) and
  names its exclusion.

### How the repo already does it, before the design (epic 2)

`/design` read the repository with a grep in the same context that was designing, which
finds what the designer expected. The only structured source of existing primitives,
`docs/analysis/components/*.md`, exists only in brownfield after `/analyze`.

- **New `pattern-scout` agent**, dispatched first by `/design`. In an isolated context it
  returns at least three **analogues** (or what was searched), the **conventions to
  mirror** per category (naming, errors, validation, data access, logging, config,
  tests) and the **integration points** where new code gets wired in, each at `path:line`
  with the real code. It documents what exists and judges nothing.
- The node map gets **Analogues**, **Conventions to mirror** and **Integration points**
  sections. A `new` node that departs from a convention says why.
- **`Mirror:` per SI** in the plan, a pointer to a Conventions row (no snippet, so it does
  not go stale). `/implement` opens it before writing; `plan-validate` flags a `Mirror:`
  that is not in the map as `DM`.
- **Consumers:** `/trim`'s reuse criterion starts from the analogues and conventions, and
  `review-standards` flags a hunk that departs from a convention with no recorded reason.

### A filter before a finding becomes a skill or a guide (epic 11)

`/session-analyze` tags findings `project` (they become a skill or guide in the project),
and `/retro` moves repeated findings into stack guides and rules. Nothing filtered what
deserved it; a generic lesson became a generic skill, loaded on every run and competing
with the good ones.

- **New `skills/retro/promotion-filter.md`**, read by `/retro` and `/session-analyze`. Three
  questions, all must pass: not findable in five minutes, specific to this codebase, cost
  real effort. A vague trigger fails too. A finding that fails stays in the report, marked
  with the question it failed; it is just not proposed as a skill or guide. The owner still
  decides what is written.
- `templates/meta-retro.md` gets a **Filter** column on project findings and a `promotable`
  count; `templates/retro.md` applies the filter before proposing a guide or rule.

### Review rules for the failures nobody sees (epic 3A)

- **`code-smells` — three new rules.** `swallowed-error` (empty catch, log and continue,
  silent default, retries that give up quietly, over-broad catch, an unhandled promise,
  and the question to ask of every catch: *what would this hide?*); `unenforced-invariant`
  (a rule the domain relies on that the type lets be broken); `comment-contradicts-code`.
  `review-quality` reads them through the catalog; `clean-code` points at the first.
- **`review-tests` checks error paths.** Every error branch the diff adds is driven by a
  test; an untested catch is where a swallowed error hides.
- **`security` — third-party integrations.** Four rules: unverified webhooks (signature
  over raw bytes, constant-time compare, timestamp and replay), OAuth/OIDC flows (`state`,
  PKCE, exact `redirect_uri`, ID-token checks), JWT validation (server-fixed algorithm,
  `exp`, `iss`, `aud`), and third-party scripts without subresource integrity.
- **`/tidy` reviews its own diff.** It runs after `/review`, so nothing else read the
  tidying commit, and it approved itself on green tests. Now `review-spec` (told the change
  claims to be structural) and `review-quality` read the tidying diff alone; a kept finding
  reverts the tidying. Counted as `review_findings`; the retro sums it.
- **`scripts/skill-rules.test.mjs`.** In every router skill (`code-smells`, `security`,
  `architecture`, `data-access`), each `rules/*.md` a row cites must exist, and each rule
  file must be cited by a row; a missing or orphaned rule used to fail silently.

### Plans are read from the outside, and decisions are weighed (epic 4)

- **`PM-N` — pre-mortem in `/plan-validate`.** Assume the plan shipped exactly as
  written and failed; name the concrete input, state or sequence no SI handles (the
  empty list, the retry after a partial write, two requests at once). Only inside the
  ticket's scope, and **at most 3 per run**, ranked — a pre-mortem asked for failures
  will always find some, and past three it invents them. Counted in `fired`.
- **`AMB-N` quotes the text and states both readings.** Vague but with one sensible
  build is not an ambiguity.
- **Lowering a lens's severity in `/review` synthesis needs `Mitigated by:`** — the
  guard, constraint or caller that contains it. Data loss, security and money are never
  lowered there; only the verifier's code check refutes them.
- **ADRs weigh at least two options**, each with pros and cons (now required, the
  chosen option's cons included). With one, the ADR stays `proposed` and asks for the
  rejected alternative. A hybrid nobody proposed is a question to the owner, not an
  option. The same floor applies to inline ADRs from `/interview`.

### The implement loop keeps what it learns, and says what it did not check (epic 5)

- **`## Learned` in `progress.md`.** When an SI finds out something about the codebase
  that the next SI would otherwise rediscover (the command that really runs the tests,
  a fixture that must be reset), it adds one line. The resume check reads it, since a
  context fresh from `/compact` has no other way to know.
- **Type-check per SI**, next to the SI's tests, instead of only at the end. A type
  error found five SIs later is far from the change that caused it.
- **No suppression to get green.** New `eslint-disable`, `@ts-ignore`, `# noqa`,
  `rubocop:disable`, skipped or focused tests are a bypass, like a weakened test. One
  that is genuinely right needs the user's OK and a reason in the SI's notes.
- **`## Not verified`** at the final verification: every AC or deliverable that no
  command in the run checked, with what would. Counted as `unverified` in the
  frontmatter; the retro reports it per ticket.
- **`tdd` no longer contradicts `implement`.** It said refactoring belongs to the review
  stage; it now says refactor only on green, which is what `implement` does per SI.

### Testing and skill-anatomy material the plugin was missing (epic 10)

Two global documents outside the plugin were still loaded in every session: a testing
guide with backend and frontend pattern files, and a skill anatomy. The plugin's own
`testing` skill covered the core, but not the recipes; its anatomy disagreed on five
rules. The global ones can go now.

- **`testing/fundamentals.md`** — controlling time (a fixed date, the real clock
  always restored); anti-patterns: conditional logic in a test, testing the framework,
  magic values; scenario grouping.
- **`testing/backend-patterns.md`** — wire unit tests by hand, no DI container; fakes
  mirror the real contract, including not-found; factory defaults are valid and each
  call independent; void success asserts the side effect; new sections on service
  fakes (stateful, no-op, literal), domain event subscribers (poll, never sleep), and
  database isolation for integration/E2E (a schema per suite, dropped at the end).
- **`testing/frontend-patterns.md`** — the static layer of the Trophy; full mount over
  shallow, with what to test and what not to; asserting absence with `query*`;
  `userEvent` over `fireEvent`; network handlers reset after each test; the three
  states of anything that loads; no side effect inside a retrying wait; new sections on
  hooks, stores, pages and routes, automated accessibility checks, anti-patterns.
- **`testing/playwright.md`** — visual comparisons.
- **New `testing/contract.md`** — consumer-driven contract testing, which the plugin did
  not mention anywhere: how it works, when it pays off, and its rules.
- **`tdd` — bugs: pin, then flip.** Tests green because of the bug, then tests red with
  the correct behavior, at every level the bug crosses; the pinned tests are removed
  only after the owner has seen them.
- **`docs/anatomy/skill-anatomy.md`** — a description does not summarize the workflow,
  and names its exclusion; token-conscious; inline under ~50 lines, a sibling file over
  ~100; a process skill has an observable exit. The folder path now matches the repo
  (`skills/<name>/`).
- Not copied: the global guide's non-deterministic faker defaults, which contradicted
  its own determinism rule.

## 0.4.1

### A stage that makes the change smaller — `/trim`

Nothing in the loop asked whether a change **needed to be this big**. `/implement`
makes the ticket work, `/review` judges whether it is right, `/tidy` shapes the code by
the rules of Simple Design. A working diff still carries a drive-by rename, a helper
the repo already had, a new file where an edit would do, one behavior threaded
through five files, and the review then spends its lenses on all of it.

- **New `/trim`**, after `/implement` and **before `/review`**, so the review reads the
  smaller diff. It reads every file the diff created or modified against the ticket's
  ACs and the plan's SIs, and proposes cuts by four criteria, in order: **trace**
  (incidental hunks no SI or AC answers for), **reuse** (new code re-implementing a
  primitive the repo has, cited at `file:line`), **footprint** (a file, layer or
  interface the change did not need), **locality** (one behavior spread over more
  files than it needs).
- **Behavior does not change.** Every cut is structural, existing tests are not
  modified, and a cut that needs a test change or turns the suite red is reverted. It
  may rewrite code to make it smaller but never adds an abstraction.
- Behavior no AC asked for is scope, not size: `/trim` records it as an
  **unrequested behavior** note, and `/review` hands the notes to `review-spec` as leads.
- Cuts are applied only if the user picks them, one at a time.
- `.scratch/<feature>/trim/<NN>-<slug>.md` records the diff's size `before` and
  `after`, and the retro sums it.
- Runs in every gear that has a review.

## 0.4.0

Nine epics, landed one per PR (#7–#15) onto a single v0.4 branch. The flow ran, and it
went wrong in ways only use shows. Tickets were cut too fine and too coarse, a review
missed an N+1, the owner had to repeat corrections across compactions. Every epic here
traces to one of those, or to measuring whether the fix worked. The v0.3 baseline
(26 tickets, two projects) was taken before any of it landed.

### Measurement (epic 7)

The flow could not say whether a change to it helped. Every count a retro would need
was on disk only as prose — and a snapshot of 26 tickets across two projects found
it written five different ways. `progress.md` had no frontmatter at all (its format
lived only in the body), so each run invented one: `sis_done: 5/5`, `si_done: 4`,
`completed: 6`, `done: [SI-1, …]`, or nothing. Plan rounds were recorded as `run:`,
as `revision:`, or not at all. Review findings named their lens in three formats,
or not at all in more than half of them. Three validations numbered findings with
no category (`PV-1`), which drops them out of every per-category count.

- **`gear` is recorded.** A `Gear` field on the ticket, copied into the plan's
  frontmatter. Until now only `/flow` knew the gear, so no stage below it could act
  on it, and nothing could be measured per gear. Absent means `full`.
- **Fixed, countable frontmatter** on every phase-2 artifact:
  - `plan.md` — `gear`, `sis_planned`, `revision`;
  - `progress.md` — `status`, `sis_done`, `sis_total`, `escalations` (an SI that
    hits the 3-attempt limit is now marked `escalated` and counted);
  - `validation.md` — `run`, and `fired`: every id ever raised, by prefix;
  - the review — `by_severity`, `by_lens`, and one `Lenses:` line per finding.
- **No uncategorised findings.** `/plan-validate` ids must use a prefix from its
  checks table.
- **`## Measurements` in the retro.** Numbers only, only from frontmatter, compared
  with the previous retro's. The comparison is the point: one retro is a snapshot.
  Artifacts that predate the fields are listed as not measured rather than
  reconstructed from prose.

### Generated guides reach the stages that need them (epic 5)

The plugin generates a guidelines router, stack guides and a project testing guide,
and the code stages already load them. But three places that need them had no path
to them at all — and in one case the rule said to read the guide while the agent
applying the rule was never told to.

- **`review-architecture`** now loads the stack guide. The `architecture` skill it
  applies says *"read the repo's stack guide before asserting that something should
  be its own component"*; the agent had no instruction to read any guide.
- **`component-mapper` and `boundary-architect`** load the stack guide too — they
  are the two stages that decide what a component *is* in this ecosystem. The system
  profile they already read describes what the code does today, which in a repo
  that packages things wrong confirms the mistake. Without a guide, each says so in
  its output.
- **`/tickets`** loads the guides, because every ticket declares a `Test seam` and
  what a seam can be is decided by the stack and the testing guide.
- **The `testing` skill** points at `testing-guide-<project>`, and says the project
  guide wins where they disagree.
- **The guides are generated earlier.** `/flow` ran `/guidelines` last in phase 1,
  after `/components` and `/boundaries` — so in the default order, the two stages
  that draw the structure could never see a guide. Now: right after `/analyze` in
  brownfield, right after `/hld` in greenfield (where the stack is decided). The
  generator reads the HLD for the stack when there is no code yet, and marks
  commands and conventions `to be established` instead of inventing them.

Phase 1's policy stages (`hld-writer`, `fdd-writer`) deliberately do not load stack
guides: policy should not be shaped by the detail.

### Marked assumptions — `AS-N` (epic 9)

A value derived from a source and a value completed from the most likely pattern read
identically: same fluency, same confidence. Asking the model to notice when it is
inferring does not help, because that answer is generated the same way. v0.3.2 solved
the factual half of this with checkable evidence (`Grounding:` + `GR-N`); this is the
other half — the decisions the repository can never answer.

- **Three markers, defined once in the `asking` skill.** `> Needs Input:` — no value is
  defensible, **blocks** the gate (unchanged). `> Assumed:` — a defensible value the
  sources do not give, with what changes if it is wrong; **listed** at the gate, not
  blocking. `> Decided:` — an `Assumed` the owner confirmed or corrected, which later
  validators treat as a source.
- **Recognise by category, not by introspection.** `asking` §6 lists the classes no
  repository answers — business thresholds, conflicting priorities, authority, external
  contract semantics, failure tolerance, domain names, future intent — and the
  **ceiling**: mark only when a different value would change a contract, schema,
  boundary or slice. A detector that fires on everything becomes an interrogation.
- **`AS-N`** in `doc-validate` and `plan-validate`: an unmarked value in one of those
  classes, above the ceiling. (`/tickets-validate` gets it when epic 1 creates it.)
- **Every gate lists the `Assumed` markers** as one grouped question. Confirming
  rewrites the marker in place; correcting goes through whoever owns the document.
- **Writers choose the weight.** `prd-writer`, `hld-writer`, `fdd-writer` write
  `Assumed` for a defensible default and `Needs Input` only when there is none;
  `component-mapper`, `decomposer` and `boundary-architect`, which choose a reading and
  proceed, now mark it `Assumed` instead of blocking.
- **The 11 templates that carry decisions** say so in their header, which is the one
  channel that reaches the isolated agents filling them. The node map's `Open
  decisions` and the plan's rules use the same markers.

Per the gear matrix, in the Small gear this reaches only `/design` and `/plan` — the
two stages that produce documents there.

### Ticket and SI size has a floor — `/tickets-validate` (epic 1)

Granularity broke in both directions: a large task cut into five tickets, and a
simple one cut into seven, one of them "write a test" and another "change a value".
Two causes. The ticket set was the **only artifact with no validator**: `doc-validate`
stops at the FDD, `plan-validate` starts at one ticket. And **every size rule was a
ceiling**, which cannot stop over-splitting, because anything small fits under it.
The one relative check, "compare side by side", lets a whole set drift together.
The v0.3 baseline shows it: in the Small gear plans ran at about one SI per
acceptance criterion (≈0.4 in the Feature gear), and one plan had 28 SIs for 16 ACs
and passed validation.

- **New `/tickets-validate`** (skill + command), run as the postflight of `/tickets`
  before the gate: `SC` coverage against the FDD, `IV` invention, `SZ` oversized
  (two seams), **`UZ` undersized**, **`SM` several tickets on one seam**, `DG` blocking
  graph, **`DS` dispersion** (max/min ACs above 3×), `AS` unmarked assumption. Writes
  `.scratch/<feature>/tickets-validation.md` with `tickets`, `seams` and `dispersion`.
- **The anchor: tickets ≈ seams.** Seven tickets over two seams means five are slicing
  inside a seam, which is the plan's job. It is a count, not a judgment.
- **The floor, as two rejection tests** at both levels: something observable changes
  through the seam (rules out "write a test"), and it traces to an acceptance
  criterion (rules out "change a value"). Structural work passes by keeping tests green
  and naming what it enables.
- **`plan-validate` gains `UZ`, `IV` and `DS` for SIs**, and points at the fastest
  signal: a plan with more SIs than the ticket has ACs.
- **`/tickets` writes local files first, always**, then validates, then asks; a tracker
  publish happens after approval. The cycle and coverage checks it did by hand are now
  the validator's `DG` and `SC`.
- The retro's Measurements report tickets, seams and dispersion per feature.

In the Small gear there is no `/tickets`, so the size gate there is `plan-validate`'s.

### Findings are verified against the code (epic 4)

`/review`'s synthesis step filters findings by what they say about themselves: a named
rule, a failure scenario. A wrong finding that is well argued passes that filter. The
lenses were never checked against the repository, which is the same gap this suite
keeps finding between stages.

- **New `review-verifier` agent**, run inside `/review` after synthesis and before the
  user sees anything. It opens every cited location and returns one verdict per
  finding, **each backed by cited code**: `confirmed`, `wrong location`, `rule does not
  apply`, `impossible scenario`, `already handled`, `duplicate`, `pre-existing` (real,
  but in code the diff did not change).
- **When in doubt, keep it.** The verdict annotates and orders; it never deletes. If
  the verifier cannot cite the code that refutes a finding, it is `confirmed`. A false
  positive costs a minute of reading; a false negative ships.
- **One verifier, not one per finding**, because `duplicate` needs the whole set.
- It stays read-only like the lenses: it returns verdicts and `/review`, which owns the
  file, writes them in, with `verdicts` and `refuted_by_lens` in the frontmatter.
- `/review` now reports by verdict, then severity. Refuted findings stay visible, at
  the end.
- The retro reads `refuted_by_lens` as each lens's **precision**. This is the first
  measure of review quality the suite has.
- `/flow` reads the review file for the review column instead of asking; the file has
  existed since v0.3.1 and the scan never used it.

### Review recall — a data lens, and one hop outside the diff (epic 2)

An N+1 query passed the whole review. Verification (epic 4) improves precision; this
was a finding that never existed, which is recall, and it had two causes. **A catalog
gap:** none of the six lenses asks what a line costs against real data, and the only
database material in the suite was about dependency direction, with performance
explicitly out of scope. **Diff scope:** the loop was in the diff and the query was in
a repository that did not change, so a lens confined to the diff could not see it by
construction.

- **New `data-access` skill**: a stack-neutral catalog with eight rules, each with its
  tell, a failure scenario stated as a data size, and the fix. The rules: N+1, query in
  a loop, chatty I/O, unbounded result, missing index, over- and under-fetching, wide
  transaction, cache invalidation. The ORM-specific spelling comes from the repo's
  stack guide.
- **New `review-data` lens**, the seventh in `/review`'s fan-out. It checks every loop,
  new query, transaction and cached write in the diff. "This could be slow" is not a
  finding; "2,000 invoices issue 2,001 queries" is.
- **Every lens may follow the call one hop.** Each lens may open the definition of a
  function the changed code calls, one level deep. This is not only for data:
  `architecture` sees a cycle that closes through an untouched file, and `security`
  follows a tainted value to its sink. A hop finding cites both locations and must be
  about this change; one that is not is the verifier's `pre-existing`.
- `lenses_run` and `by_lens` include `data`.

The hop multiplies reading by seven lenses. Measure it on first use; if it weighs,
narrow it to the patterns each lens names.

### Dependency audits go stale, and `/flow` notices (epic 8)

`/audit-deps` had no recurrence at all. The report also carried no date, so a
three-month-old audit read as current. Dependencies drift even when the code does not:
a new advisory lands against a lockfile nobody touched.

- **The audit records itself**: `audited_at`, `audited_commit` and `lockfiles` in the
  frontmatter of `docs/analysis/dependencies.md`.
- **`/flow` detects staleness and asks**, in the Full and Feature gears only. It fires
  on either of two signals: a listed lockfile changed since `audited_commit`, or the
  audit is more than 30 days old. It never re-runs anything on its own.
- The detection lives in a new "Checks that go stale on their own" section of `/flow`,
  where structural reconciliation (epic 6) will join it.

### Structural reconciliation, and a tidy stage (epic 6)

Component architecture and the dependency graph are always moving, through the agent's
own changes and the team's. Cycles were checked well **at the moment of a change**,
but nothing re-read the whole structure afterwards. `/components` re-ran only when the
HLD changed, `review-architecture` saw only its own diff, and a teammate could merge a
cycle that nothing in the flow noticed. Re-running `/components` rewrote the vocabulary
every FDD uses, with no ids and no history. And the architecture rules were only ever
used to **judge** a structure, never to **find** one.

- **One way to measure the graph.** `architecture/import-graph.md` is the method
  `/analyze`, `/reconcile` and `review-architecture` all use: the ecosystem's native
  tool when installed (`go list`, `madge`, `pydeps`, `jdeps`, …), otherwise a
  per-language grep recipe. Ruby and Rails autoloading is covered by constant
  references, flagged `approximate`. Edges are counted by file references, and the
  method is recorded per language.
- **The graph gets its own file**, `docs/analysis/dependency-graph.md`, with
  `measured_commit`, so it can be re-measured without rewriting the system profile.
- **New `/reconcile`** (`reconciler` agent). It re-measures, then reports the drift:
  new edges the contract does not allow, new cycles, unassigned files, empty or
  split components. Each item comes with the commits behind it, and the report says
  which stage should amend. It never edits `components.md` or `boundaries.md`; those
  stages apply the amendments with their own protocols.
- **Latent-component detection**, run with the reconciliation because the graph is
  already measured. A set of modules is proposed as a component only when **two of
  the three** principles agree, each by measurement: CCP by co-change in `git log`,
  CRP by co-import, REP by existing packaging. At most **3 proposals** per run,
  ranked; the rest are reported as a count. It never applies anything.
- **`components.md` gets permanent ids and `Retired` rows**, the same protocol
  `/decompose` has had since v0.3.1. Re-runs amend instead of rewrite.
- **`/flow` offers `/reconcile`** when a commit by someone else landed after
  `measured_commit`, in the Full and Feature gears only, and only once a component map
  exists.
- **New `/tidy`**, after `/review`, scoped to the ticket's diff. It applies Beck's four
  rules of Simple Design in order: rule 1 (tests) is already guaranteed by
  `/implement`, so it starts at expression, then duplication, then size, never size
  first. Each tidying is proposed with evidence and applied only if the user picks it,
  one at a time, as a structural change. Existing tests are not modified; a tidying
  that needs a test change, or turns the suite red, is reverted. It is named `/tidy`
  (Beck's *tidy after*) so it does not collide with Claude Code's built-in `/simplify`.
- The retro reads `tidy/*.md`. Many reverted tidyings means the proposals were not
  really structural.

### Reading the whole session — `/session-analyze` (epic 3)

`/retro` reads what the work left on disk. It cannot see what only the conversation
holds: the owner correcting a proposal, rejecting a question, saying "this got too
big", asking for the same thing twice. Both symptoms that opened this version were
noticed that way, not by a gate. `/compact` deletes nothing from the transcript; one
measured session was 208 MB, of which 2.5 MB was conversation, across 15 compaction
segments.

- **`scripts/session-extract.mjs`**: the plugin's first script. It uses the Node
  standard library only and streams the JSONL. It resolves the transcript from the
  working directory (the most recent session, or `--session <id>`) and writes one file
  per compaction segment to `.scratch/session-analyze/<id>/`, plus an index. It keeps
  what the owner **said**, **answered** in structured questions (with notes) and
  **rejected** (the text given with a refused tool call), and the assistant's text with
  only the **names** of its tools. It drops file snapshots, tool results and arguments
  (where file contents and secrets live), thinking, subagent turns, compaction
  summaries, injected reminders and harness notifications. Its 28 tests cover all of
  that; the 208 MB session extracts in about a second.
- **New `session-segment-analyst` agent**, one per segment, all in parallel. A segment
  fits one agent whole, so it reads the original conversation, not a summary.
- **The evidence rule is stricter than `/retro`'s.** A finding exists only on an owner
  turn that corrects, rejects or repeats, cited by uuid and timestamp with the owner's
  own words. The assistant criticizing itself is not evidence, and neither is accepting
  a recommendation.
- **Repetition across segments comes first** in the report: the owner said it once,
  the flow did not learn, and they said it again.
- **Every finding is tagged `flow` or `project`.** A flow finding becomes an
  improvement to the plugin; a project finding becomes a skill or guide in that project.
  Acting on the tags comes after 0.4, but the tag is set now, because re-classifying
  later means re-reading everything.
- Report: `docs/meta-retro/<date>-<session>.md`, from `templates/meta-retro.md`.
  Copilot transcripts are out of scope.

### Fix — three v0.4 skills were never registered

`tickets-validate` (epic 1), `data-access` (epic 2) and `tidy` (epic 6) were added on
disk but not to `plugin.json → skills`, which lists skills explicitly. They would not
have loaded, and nothing would have said so. They are registered now, and
**`scripts/plugin-manifest.test.mjs`** fails whenever a skill folder and the manifest
disagree. Run `node --test scripts/*.test.mjs` before shipping a skill.

## 0.3.6

0.3.5 quoted the frontmatter the plugin ships. This closes the same trap in the
frontmatter the plugin **generates** — which is where it actually bit: a guide
produced by `/generate-test-guide` failed to load, and the only signal was a
startup warning.

- `generate-test-guide` and `generate-stack-guide` now require the generated
  `description` to be quoted. These two write the exact shape that breaks strict
  YAML: a description that names trigger phrases carries double quotes and a
  `Triggers:` label, and the unquoted colon-space reads as a nested mapping.
  Single quotes, since the trigger phrases use double ones.
- `docs/anatomy/skill-anatomy.md` states the rule and quotes `description` in its
  own example — the unquoted example is what propagated the pattern.

The failure mode is worth naming: a skill whose frontmatter does not parse **does
not load at all**, and nothing says so at the point of use. It also fails loudly
under a strict parser and silently under a lenient one, so "it works on my host"
is not evidence that the file is correct.

## 0.3.5

Command frontmatter is strict YAML, and two `argument-hint` values were not valid
YAML at all. They loaded under a lenient parser and failed under a strict one — and
a command that fails to parse is simply **absent**, with no error at the point of use.

- `commands/generate-test-guide.md` — `<project folder> (default: current directory)`
  reads as a nested mapping because of the colon-space, aborting the parse.
- `commands/interview.md` — `[feature or project name]` parses as a **list**, so the
  field is rejected as the wrong type.
- **All 26 `argument-hint` values are now quoted**, not only the two that broke. A rule
  applied to the failures alone does not prevent the next one; the field attracts both
  traps because it is written as prose. Single quotes where the text contains double
  quotes.
- `docs/anatomy/command-anatomy.md` states the rule and names both traps — and its own
  example, which showed an unquoted `[feature]`, was the thing propagating the bug.

## 0.3.4

Auto-discovered directories have no ignore convention: every `.md` under `agents/`
and `commands/` is loaded as an artifact, so the directory READMEs were shipping as
a malformed agent and as a real `/README` command. Under a host that treats commands
as description-matched skills, that stray entry also competed for auto-invocation
with a description that describes nothing.

- **`agents/README.md` and `commands/README.md` removed.** Their content — the agent
  inventory, why the `review-*` lenses are narrow, why commands stay thin, why
  `/flow` keeps no state file — moved into `docs/anatomy/agent-anatomy.md` and
  `docs/anatomy/command-anatomy.md`, which already owned "how to write one". One
  place per concept instead of two.
- Both anatomy docs now state the loading rule outright, so the next person does not
  re-add a README to a scanned directory.
- `skills/README.md` and `templates/README.md` stay: skills are discovered as
  `skills/<name>/SKILL.md` and `templates/` is not scanned, so neither is loaded.

## 0.3.3

Two rules about how a stage talks to the user, in one shared `asking` skill loaded
by every command that reports, gates, or asks.

- **An id is an address, not a message.** `CV-3`, `RF-007`, ticket `04`, `ADR 0012`
  — cited alone, each one sends the reader hunting through documents for a row the
  asker already had open. Every identifier now gets resolved where it is spoken:
  the id **plus** the shortest phrase that makes it recognisable, preferably quoted
  from the original so it can be searched for. This holds for findings, gate
  reports, progress summaries, questions, and the `> Needs Input` markers isolated
  agents write — those now say to name the thing rather than cite its id.
- **Offer a choice when the answer is a closed set.** A structured option list
  beats an open question the user has to compose an answer to: recommendation
  first, labelled by outcome rather than mechanism, each with what it costs. Free
  text stays for genuinely open answers. Twelve findings do not become twelve
  prompts — ask about what blocks, report the rest.

The skill also carries two principles the suite already held in one place each and
now states once: **ask only what is a decision** (facts are yours to discover —
lifted from the `interview` skill, where it was a local rule), and **make the
default visible** when proceeding under an assumption, so a wrong one costs a
one-word correction instead of being discovered three stages later.

## 0.3.2

From running the flow on a small task and watching it manufacture scope. The
agent's own post-mortem named the mechanism: *"o fluxo amplificou em vez de
checar. Cada estágio tomou o anterior como dado. O `/plan-validate` confere o
plano contra o node map — mas ninguém conferiu o node map contra o repositório.
O portão que existia para pegar excesso foi justamente o que o introduziu."*

**The structural cause.** Every artifact in the chain is derived from the
previous artifact, and every check the suite performs is internal consistency —
`/doc-validate` compares document to document, `/plan-validate` compares plan to
ticket and node map, `/review` compares diff to spec. Nothing consults the
repository. So a wrong assumption made early passes every gate, because it is
perfectly consistent all the way down, and each stage elaborates it instead of
questioning it. This is the failure the overloading principle already named for
documents, one level up: the second representation has to be one the first did
not produce, and the only independent source in the chain is the code itself.

- **`/design` reads the repository before drawing.** A new section, before the
  map is built: grep the domain nouns, the likely symbols, the neighbouring
  feature that already does this. The node map's `Reuses` field becomes
  **`Grounding`**, and `new` is only accepted with the search recorded — what was
  searched for, where, and what was found. A claim that something must be built
  is falsifiable by one grep, and that asymmetry is what makes the discipline
  cheap. A new `Grounding summary` table collects the claims.
- **`/plan-validate` gains `GR-N`** — a node called `new` with no recorded search,
  or with a search a grep contradicts. It is the only check in the suite that
  leaves the documents, and the validator runs the searches itself rather than
  trusting the map. A node that turns out to already exist is the highest-value
  finding the stage can produce: everything below it was about to be built twice.
- **`/design` says so when the search shrinks the ticket**, and offers to amend it
  before planning. That outcome is the stage working, not the ticket failing.
- **`/tickets` codebase exploration is no longer optional** when code exists. The
  amplification in this incident began one stage earlier than the post-mortem
  found: the ticket already said "build" for something that was already built.

**Gears.** The flow had one speed and applied it to everything. Running the full
chain on a two-hour change does not merely cost more — it manufactures scope,
because every template is a completeness contract and a completeness contract
applied to small work gets filled with invented content. `/flow` now sizes the
work before proposing anything and picks the shortest path that fits: **full**,
**feature**, **small** (straight to the dev loop, no FDD), or **direct** (no stage
at all — say so and let the user just do it). The choice is stated and confirmed,
and it is recorded in the ticket's `Source`, so a later scan can tell a deliberate
skip from a missing document and stops offering to generate what was declined.

## 0.3.1

Hardening of `/decompose`, from a review that compared its output against a
hand-built backlog corrected across seventeen shipped tickets. The comparison
found four structural gaps and one live hazard; all are fixed here.

- **Ids are permanent addresses.** A re-run may never renumber — `docs/fdd/<slug>.md`
  paths and the `.scratch/<slug>/issues/` directories `/tickets` published are keyed
  on these ids, so inserting a feature and renumbering silently invalidated artifacts
  that already existed. New items take a suffix (`F3a`); retired ids are never reused.
- **Re-runs amend instead of rewriting.** A removed, merged or split feature is struck
  through in a `Retired` section with its reason and where its scope went. Previously a
  re-run overwrote the file and the earlier cut survived only in git, which left a reader
  unable to tell a deliberate removal from an oversight.
- **Cross-feature dependencies have somewhere to live.** `/tickets` reads one FDD at a
  time, so its blocking graph — authoritative at ticket level — is necessarily
  per-feature, and an edge between two features had nowhere to be written down. The
  Features table gains a `Depends on` column, declared coarse and advisory so two graphs
  don't get maintained as rivals, plus a product-wide cycle check in the decomposer's
  workflow and a `DG-N` category in `/doc-validate`.
- **Epics are ordered by risk, not only by parallel safety.** Component overlap says what
  may run *together*; nothing said what should run *first*. An epic that exists to
  **falsify** a structural decision now names it, by ADR id or HLD section, and belongs at
  the front — the cheapest moment to be wrong about a decision is before anything is built
  on it. A soft `Adopted by` edge covers the epic that should precede its consumers but
  must never block them.
- **Partial coverage is not coverage.** A requirement naming two things, of which a feature
  delivers one, is listed as `partial` rather than ticked. Half a proof credited as a proof
  is how a requirement gets marked done by a release that does not meet it. `/doc-validate`
  gains `PC-N` for it.
- **A negative scope bound per feature.** `Not delivering` records the boundary with the
  neighbouring features — a scope decision knowable at decomposition time — and `/fdd` now
  carries it into `Scope and exclusions` instead of inferring it, differently, per run.
- **A third disposition for untraced findings.** Besides "scope creep" and "missing
  requirement", a finding that traces to neither the PRD nor an ADR goes to
  `docs/evolutions.md` — which keeps it without turning the decomposition into a junk drawer.
- **ADRs traced where they exist.** A `Constrained by` column, populated from formal ADRs or
  from the candidates the HLD flagged, explicitly left empty rather than guessed: most ADRs
  are formalized after this stage runs.
- **A guardrail against unearned evidence.** The decomposer has no shell and no repository to
  measure against, so every cell it fills is a decision or a reading of a document, never a
  measurement. A sentence that sounds like evidence and isn't is worse than none.

### `/retro` — the learning loop

The suite had no stage that writes back. Every other one writes forward, the documents freeze at
approval, and what the work taught lived in progress notes nobody reopened and in a conversation that
is gone at the next `/compact`. The out-of-scope observations `/implement` collects were "reported as
follow-ups" — into a chat window.

`/retro <epic | feature | cycle>` reads what finished work left on disk — tickets, node maps, plans,
`validation.md` (including its `Resolved` history, the closest thing the suite has to a record of which
mistakes this project actually makes), `progress.md`, and the review files — and sorts what it finds by
subject: **process** findings to `docs/retro/<scope>.md`, **product** findings appended to
`docs/evolutions.md`. A defect is neither, and goes back as a ticket.

It runs over a set of tickets, never one: repetition is most of the value, and a finding that recurs
across tickets is a standard that should move into a stack guide or a rule — a conclusion no single
review can reach.

Two constraints make it trustworthy rather than plausible. **Every claim cites the artifact it came
from**: it may not say the work was hard or a decision was debated, because none of that is on disk;
what is on disk is a fix loop that hit three attempts and a validation that took four rounds. And a
required section names **what the artifacts couldn't tell it**, so the document doesn't imply coverage
it doesn't have. Both outputs are append-only logs — nothing derives current state from them, which is
why they don't violate `/flow`'s refusal of maintained state files.

**`/review` now persists its findings** to `.scratch/<slug>/reviews/<NN>-<slug>.md`. Without that, a
review's output lived only in the conversation, and the retro's best input would have been an empty
directory.

Deliberately not adopted: a Task rung between epic and feature (its only datum is a cascade
of its children's edges); a per-feature mutable state column (the disk already answers it, and
`/flow` refuses maintained state files); and a fixed cap on slices per item — the review
records that rule being violated four times without its remedy ever being chosen, which is the
signature of a rule naming the wrong subject. Relative sizing against a declared seam stays.

## 0.3.0

A stage-by-stage audit of the whole suite, then the fixes. Two findings shaped everything below.

**The code phase was better engineered than the doc phase.** It separated authoring from verification (`plan` → `plan-validate`), emitted a machine-readable verdict, checked coverage in the omission direction, recorded traceability in the artifact, and discovered the environment's real commands. The doc phase had authoring and a human gate and nothing between them. Most of this release ports mechanisms that already worked one floor up.

**The dominant failure was "the ruler exists and nothing connects the wire".** `Status`, `Level`, the JSON contract, `Main components`, the `(required)` markers, the FDD's test seams — all present in the templates, with neither a writer nor a reader. Repeatedly, the work was wiring rather than inventing.

### New stages

- **`/components`** — the system component map, between the HLD and the FDDs. The HLD was already required to list components and nothing turned that list into a shared map, so each FDD invented its own carve-up and no one owned the cross-feature picture. Responsibilities are stated twice — owns and does not own — because gaps and overlaps only show up against the negative half. In brownfield it computes `I`/`A`/`D` and reports every dependency cycle.
- **`/decompose`** — epics and features. `Level: module (EPIC)` lived in the PRD template with no stage producing it, which left the 1:N coverage check without a denominator and let feature-size drift set the ticket-size drift beneath it. Each epic carries a parallel-safe set derived from component overlap, so worktree-per-epic becomes a lookup.
- **`/boundaries`** — the dependency contract, after the FDDs, because that is when the axes of change become knowable. An exhaustive allow-list of edges, policy versus detail, inversions flagged as ADR candidates, and a YAML manifest saying the same thing as a graph so prose and rule can contradict each other detectably.
- **`/doc-validate`** — the `plan-validate` the doc phase never had. Same shape: ID'd categories, a `clean | dirty` verdict in frontmatter, never auto-fixes. It carries the check nothing else performed — coverage in the **omission** direction, plus the 1:N set-coverage form where an entire unspecced feature used to hide.
- **`/design`** — existed in the flow diagram and in `tickets.md`, and not in `commands/`. Now a real command with preflight and postflight, and the node map is **written to a file**. It called itself the authoritative design contract while living only in the conversation: dying at `/compact`, invisible to the flow scan, unreachable by review, uncheckable by validation.
- **`/generate-stack-guide`** — per-technology guides in the router + rules shape, source-agnostic.

### New references

- **`architecture`** (20 rules) — the rung between SOLID and a system: the six component principles, the Main Sequence with its two zones, how to compute the metrics from an import graph, the Dependency Rule, boundaries and partial boundaries, plugin architecture, the level graph, and why the database, the web and the framework are details.
- **`security`** (23 rules) — OWASP as the taxonomy for grouping, CWE-level weaknesses as the scannable unit, including the LLM pair. Every finding owes a rule, a concrete failure scenario, and a fix.

### Changed

- **`/flow`** now **scans first**: it reads the artifacts on disk, reports where the project stands and what is awaiting approval, and only then proposes the next stage. That behaviour was the most common way the command was used and was nowhere in the file — it worked by the model's good sense, which means it varied between runs. State stays derived: no status file, so no subcommand owes an update to a document that isn't its own. Phase 2 is documented as a matrix per ticket rather than as a stage.
- **`/guidelines`** produces a **150-line router** instead of the 1,000–1,500 lines it previously mandated — a document four stages loaded whole to use twenty lines of. Its routing table maps file patterns to stack guides, which makes guide resolution deterministic rather than dependent on the model remembering to look.
- **`/review`** fans out into six narrow agents over a diff computed once, with synthesis as a required step. `code-smells` and `clean-code` stay in one agent: the split with the highest duplicate rate and the lowest recall gain. Adds the security and architecture lenses.
- **`/analyze`** splits by audience — `system-profile.md` (facts the stages consume, including the import graph as data) and `architecture.md` (analysis a human reads) — works global-first, declares its coverage so a sampled analysis stops reading like a complete one, and chains the deep dives over the components it discovered.
- **`/audit-deps`** runs the ecosystem's own `outdated`/`audit` commands as the primary path. Vulnerabilities require an advisory id, maintenance health drops "a year without commits" for signals that mean something, license risk needs the project's distribution model, and output ranks by required action with the catalog as an appendix.
- **`/tickets`** sizes by the FDD's declared test seam — observable, comparable, already written down — replacing "fits one fresh context window", which the SI refactor had made obsolete. Adds relative sizing, a side-by-side comparability check, mechanical cycle detection on the blocking graph, numbered acceptance criteria, and a `Status` that records readiness instead of presuming the executor.
- **`/interview`** loads both of its skills explicitly, gates on a count of required sections, inherits from the PRD instead of re-eliciting, and asks what cannot change in brownfield.
- **`/research`** allows labelled secondary sources, uses Context7 when available, records the version rather than the date, reports conflicts between sources instead of resolving them silently, and can fan out the deep read.
- **`/prd`**, **`/hld`**, **`/fdd`** honour `Level`, record origins, answer every RNF, name components from the map, and number their criteria.
- **ADRs** — Potentials lose their numbers so `adr-generator` owns one sequence; `potential/` gains a lifecycle so re-runs stop re-proposing; the sweep reconsiders the brief's recorded decisions; and `--brownfield` finally says *how* to mine git history.
- **`/plan`** requires the node map and refuses to design inline, restoring the design gate to its own stage. **`/plan-validate`** gains the FDD as a source, a design-divergence category, and a category for the oversized SI the single-act rule already forbade.
- **`/implement`** resolves the project's stack guides through the router instead of remembering to look, and handles structural tickets — no red step, existing tests unmodified and green.

### New templates

`ticket.md` (the artifact phase 2 runs on, and the only one that had none), `components.md`, `boundaries.md`, `features.md`, `system-profile.md`.

### Removed

- `agents/reviewer.md` — replaced by the six `review-*` lenses.
- The self-contained constraint on `docs/guidelines.md`. It was decided before per-technology guides existed; referencing them is now the point. Generated project artifacts still reference nothing outside the project, and the plugin as shipped remains self-contained.

## 0.2.0

Rebuilt the code phase as a validated, test-first loop: `/tickets → /design → /plan → /plan-validate → /implement → /review`. Vendored the testing and code-quality references so the plugin ships self-contained.

## 0.1.0

Initial release — the Doc-Dev flow, interview through documentation to development.
