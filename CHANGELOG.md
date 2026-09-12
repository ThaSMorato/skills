# Changelog

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
