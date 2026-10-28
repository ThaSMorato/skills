# thasmorato-skills

A Claude Code plugin implementing an **AI Doc-Dev flow**: from the requirements interview, through complete documentation and architecture, to a validated test-first development loop, importable per project (marketplace).

## The flow

`/tm-flow` drives the whole thing. It **scans the disk first** and tells you where the project stands and what is waiting for your approval, then names the next stage for you to run. It never runs one itself, and no stage runs another: every stage ends at its postflight and waits for you, because the AI drafts and the human validates.

```
/tm-flow  (coordinator: scans state from artifacts, never from a status file)
 ├─ brownfield:  /tm-analyze · /tm-audit-deps → /tm-guidelines (+ stack guides)
 ├─ Phase 1 (docs):
 │     /tm-interview → /tm-research → /tm-prd → /tm-hld (+/tm-c4-generate)
 │       → greenfield: /tm-guidelines (+ stack guides)
 │       → /tm-components → /tm-decompose → /tm-fdd (+/tm-mermaid-generate) → /tm-boundaries
 │       → /tm-adr-identify (or /tm-adr-propose "<decision>") → /tm-adr-generate → /tm-adr-link
 │     with /tm-doc-validate between each pair, before every gate
 └─ Phase 2 (dev, per frontier ticket):
       /tm-tickets (→ /tm-tickets-validate) → /tm-design → /tm-plan → /tm-plan-validate → /tm-implement → /tm-trim → /tm-review → /tm-tidy → /tm-acceptance → /tm-walkthrough → /tm-pr
       bug of unknown cause: /tm-diagnose → fix test-first, or a bugfix ticket → /tm-design → /tm-plan …
       structure drifts: /tm-reconcile → /tm-components · /tm-boundaries amend
```

**Two architecture beats, deliberately apart.** `/tm-components` builds the system component map *before* the feature specs, so every FDD shares one vocabulary. `/tm-boundaries` writes the dependency contract *after* them, because the axes of change a boundary separates are only knowable once the features are specced.

**Authoring is separated from verification, in both phases.** `/tm-plan-validate` gates the code phase with a machine-readable `clean | dirty` verdict; `/tm-doc-validate` does the same for the doc phase, checking coverage in the direction nothing else asks about: what the source said and the target dropped. `/tm-tickets-validate` covers the step between them: the ticket set as a whole, including the tickets that are too **small**, which no ceiling can catch.

**The dev loop is test-first and gated.** `/tm-design` writes the node map to a file, `/tm-plan` slices a ticket into vertical SIs, `/tm-plan-validate` must report `clean`, and `/tm-implement` runs each SI red → green → refactor (production *and* tests), stopping between SIs so you can `/compact` and resume.

## Where the documents live

The documents describe the **system**, not the task that changed it. A task edits them on its branch, so `main` says what the system does now and the merge applies the change; what belongs to one effort is temporary.

```
CONTEXT.md                    the glossary
docs/
  product/                    prd.md, design-system.md
  architecture/               hld.md, components.md, boundaries.md, c4/
  features/README.md          the feature index: what the system has, and where each feature's docs are
  features/<feature>/         README.md, fdd.md, prd.md, diagrams/, ui/  (living, one folder per feature)
  adr/                        records: changed only by a new ADR
  guidelines.md, guardrails.md, analysis/, research/, retro/, …
.scratch/<effort>/            brief.md, scope.md, decomposition.md, criteria/<feature>.md  (die with the effort)
.scratch/<feature>/           tickets, plans, progress, reviews
```

A living document is **amended, never rewritten**: the writer changes it section by section, ids stay, and every decision the amendment changed is listed for `/tm-adr-identify`. It carries no acceptance criteria and no milestone: those are the effort's (`scope.md`, `criteria/<feature>.md`), and `/tm-acceptance` turns each delivered criterion into a rule in the feature's `fdd.md`. The branch that changes the code fixes the docs it made false, and `review-docs` checks it.

**Read in Obsidian (or on GitHub).** The documents link to each other with relative Markdown links to the file, the id as the text (`[RF-003](../../product/prd.md)`), which both follow; in Obsidian they also give the backlinks and the graph of the chain. Set **Settings → Files and links → Use [[Wikilinks]] off** and **New link format: Relative path to file**, so the links Obsidian creates match. The living documents and the ADRs carry `kind`, `status` and `level` or `feature` as frontmatter properties, for Bases to filter on, and the `> Needs Input:`, `> Assumed:` and `> Decided:` markers are callouts, a colored box in both.

A project from before 0.7.0 moves with `/tm-docs-migrate` (temporary), which proposes the map and moves nothing until you approve it.

## Install

```bash
/plugin marketplace add ThaSMorato/skills
/plugin install thasmorato-skills@thasmorato
```

Or, from a local checkout: `/plugin marketplace add <path-to-this-repo>`.

### Codex

```bash
codex plugin marketplace add ThaSMorato/skills
codex plugin add thasmorato-skills@thasmorato
```

Then, in a new Codex session, run `$thasmorato-skills:tm-setup` once per plugin version: Codex does not load subagents from a plugin, so the setup installs them into `~/.codex/agents/` as `tm-<agent>`. Differences from Claude Code:

- **Stages are skills, not slash commands,** under the same names: `/tm-plan` is `$thasmorato-skills:tm-plan`. Codex has built-in review, plan and init commands of its own; those are not this plugin.
- **Stages never fire on their own.** Every `tm-*` skill is closed to implicit invocation; only the owner typing its name runs it. The reference skills (`testing`, `tdd`, `security`, `code-smells`, `clean-code`, `architecture`, `data-access`, `domain-model`, `ui`, `asking`) stay open, as in Claude Code.
- **"Never edits" is an instruction, not a sandbox.** Codex ignores a subagent's `sandbox_mode`, so the review lenses are read-only only because they are told to be. Run the session read-only when that has to hold.
- **Subagents think at their own effort, on your model.** Each `tm-<agent>.toml` carries the agent's `model_reasoning_effort` and no `model`: the model is your profile's or your session's (or `[agents] default_subagent_model` in your Codex config).
- **At most six subagents run together** (Codex's default `agents.max_concurrent_threads_per_session`); `tm-review` runs its lenses in batches.
- **Codex reads `AGENTS.md`, not `CLAUDE.md`.** A project that keeps its instructions in `CLAUDE.md` can add `project_doc_fallback_filenames = ["CLAUDE.md"]` to its Codex config.

The Codex package in `codex/` is generated: edit the source, then run `node scripts/build-codex.mjs`.

## Commands

Every command carries the `tm-` prefix (since 0.7.0), so no Claude Code built-in or other plugin can take its name; the CHANGELOG has the table from the old names.

| Stage | Commands |
|---|---|
| Orchestration | `/tm-flow` · `/tm-docs-migrate` (temporary) |
| Brownfield analysis | `/tm-analyze` · `/tm-audit-deps` |
| Requirements | `/tm-interview` · `/tm-questionnaire` · `/tm-research` |
| Documentation | `/tm-prd` · `/tm-hld` · `/tm-fdd` · `/tm-doc-validate` |
| Architecture | `/tm-components` · `/tm-decompose` · `/tm-boundaries` · `/tm-reconcile` |
| Diagrams | `/tm-c4-generate` · `/tm-mermaid-generate` |
| Decisions (ADR) | `/tm-adr-identify` · `/tm-adr-propose` · `/tm-adr-generate` · `/tm-adr-link` |
| Standards | `/tm-guidelines` · `/tm-generate-stack-guide` · `/tm-generate-test-guide` · `/tm-guardrails` |
| Development | `/tm-tickets` · `/tm-tickets-validate` · `/tm-ui-audit` · `/tm-ui-design` · `/tm-design` · `/tm-prototype` · `/tm-plan` · `/tm-plan-validate` · `/tm-implement` · `/tm-trim` · `/tm-review` · `/tm-tidy` · `/tm-acceptance` · `/tm-walkthrough` · `/tm-pr` · `/tm-diagnose` |
| Looking back | `/tm-retro` · `/tm-session-analyze` · `/tm-flow-report` |
| Learning | `/tm-teach` |
| Session | `/tm-wait-what` · `/tm-handoff` |
| Writing | `/tm-writing-fragments` · `/tm-writing-beats` · `/tm-writing-shape` |

## Structure

| Folder | Role |
|---|---|
| `skills/` | Skills (model-invoked / interactive): run in the main context. Doc/design (`interview`, `domain-model`, `ticket-design`), the dev loop (`ticket-plan`, `plan-validate`, `tdd`, `implement`), verification (`doc-validate`, `tickets-validate`), the learning loop (`retro`), generators (`generate-test-guide`, `generate-stack-guide`), and self-contained references (`testing`, `code-smells`, `clean-code`, `architecture`, `security`, `data-access`, `ui`) |
| `commands/` | User entrypoints (`/tm-flow`, `/tm-interview`, `/tm-prd`…) |
| `agents/` | Heavy generation and review subagents (isolated context, parallelizable) |
| `templates/` | Canonical skeleton per artifact (generation scaffold + handoff anchor + gate checklist) |
| `codex/` | The Codex package, **generated** from the folders above by `scripts/build-codex.mjs`; never edited by hand. `.agents/plugins/marketplace.json` points Codex at it |
| `adapters/codex/` | The little that exists only in Codex: the `tm-setup` skill |
| `scripts/` | The few things that have to be code: the session-transcript extractor behind `/tm-session-analyze`, the Codex build and its agent installer, and the plugin's own consistency tests. Node standard library only, no dependencies; run the tests with `node --test scripts/*.test.mjs` |
| `docs/anatomy/` | Authoring standards (skill/command/agent/plugin anatomy) |

## Design principles

Software-engineering concepts apply to building AI workflows, and the suite is designed with them on purpose:

- **Deep modules.** A skill is a lot of knowledge behind one name: `code-smells` is thirty files and a single interface.
- **Interface segregation, with attention as the currency.** Loading 1,500 lines to use 20 is depending on what you don't use. Hence routers with lazy detail: `docs/guidelines.md` is an index, not a manual.
- **Derived state, no write coupling.** `/tm-flow` reads artifacts; no subcommand owes an update to a document that isn't its own, so every stage runs standalone.
- **Overloaded definitions.** Load-bearing terms are defined twice, on different axes; the boundary contract says the same rule in prose and as a graph. Two representations of one intent make a contradiction detectable.
- **Dual audience.** Every document above the ticket is executable by a person and by an agent; below it, the bar is auditability rather than executability.

## Pattern references
Skills were re-authored here following these as models (not as dependencies):
- [mattpocock/skills](https://github.com/mattpocock/skills): grilling, to-spec, to-tickets, domain-modeling, tdd, code-review; and in v0.6, diagnosing-bugs, retro, writing-for-agents, codebase-design, improve-codebase-architecture (the HTML report), pr (itself crediting Dex Horthy's show-me, Humanlayer), prototype, teach, to-questionnaire, wait-what, handoff, setup-pre-commit, git-guardrails-claude-code, and the writing-fragments / beats / shape trio.
- UI and UX, in v0.6.1 (`/tm-ui-audit`, `/tm-ui-design`, `ui-critic`): Jakob Nielsen's [10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) and NN/g's heuristic-evaluation and severity method; [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (critique, audit, shape, new-work, operate, harden, clarify; Apache-2.0); [anthropics/skills](https://github.com/anthropics/skills) frontend-design (Apache-2.0); [emilkowalski/skill](https://github.com/emilkowalski/skill) break-ui and motion (MIT); [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) (MIT); [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) redesign audit (MIT); [google-labs-code/design.md](https://github.com/google-labs-code/design.md) (Apache-2.0); and [Laws of UX](https://lawsofux.com/) by Jon Yablonski, paraphrased.
- Product thinking, in v0.6.2 (beta): Drew Hoskins, *The Product-Minded Engineer* (O'Reilly, 2025): guiding scenarios carried from the brief to acceptance, shoe-shifting and strawman users, thesis and antithesis, nonpersonas, requirements as a use-case compendium, the first milestone as one complete scenario, non-functional requirements seen from the user's side, actionable errors and shifting them left, affordances sorted green, yellow and red and signaled to match (signifiers, v0.6.3), the rule of three, and customer discovery interviews. Rewritten here, paraphrased.
- [devfullcycle/claude-mkt-place](https://github.com/devfullcycle/claude-mkt-place): adrs-management, diagrams-generator, development-guidelines, project-analizer.
