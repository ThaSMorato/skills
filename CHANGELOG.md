# Changelog

## Unreleased — v0.4

v0.4 lands one epic per PR; the version is bumped with the last one.

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
