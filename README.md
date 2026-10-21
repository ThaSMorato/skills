# thasmorato-skills

A Claude Code plugin implementing an **AI Doc-Dev flow**: from the requirements interview, through complete documentation and architecture, to a validated test-first development loop, importable per project (marketplace).

## The flow

`/flow` drives the whole thing. It **scans the disk first** and tells you where the project stands and what is waiting for your approval, then runs the next stage, stopping at human gates, because the AI drafts and the human validates.

```
/flow  (coordinator: scans state from artifacts, never from a status file)
 ├─ brownfield:  /analyze · /audit-deps → /guidelines (+ stack guides)
 ├─ Phase 1 (docs):
 │     /interview → /research → /prd → /hld (+/c4-generate)
 │       → greenfield: /guidelines (+ stack guides)
 │       → /components → /decompose → /fdd (+/mermaid-generate) → /boundaries
 │       → /adr-identify → /adr-generate → /adr-link
 │     with /doc-validate between each pair, before every gate
 └─ Phase 2 (dev, per frontier ticket):
       /tickets (→ /tickets-validate) → /design → /plan → /plan-validate → /implement → /trim → /review → /tidy → /acceptance → /walkthrough → /pr
       bug of unknown cause: /diagnose → fix test-first, or a bugfix ticket → /design → /plan …
       structure drifts: /reconcile → /components · /boundaries amend
```

**Two architecture beats, deliberately apart.** `/components` builds the system component map *before* the feature specs, so every FDD shares one vocabulary. `/boundaries` writes the dependency contract *after* them, because the axes of change a boundary separates are only knowable once the features are specced.

**Authoring is separated from verification, in both phases.** `/plan-validate` gates the code phase with a machine-readable `clean | dirty` verdict; `/doc-validate` does the same for the doc phase, checking coverage in the direction nothing else asks about: what the source said and the target dropped. `/tickets-validate` covers the step between them: the ticket set as a whole, including the tickets that are too **small**, which no ceiling can catch.

**The dev loop is test-first and gated.** `/design` writes the node map to a file, `/plan` slices a ticket into vertical SIs, `/plan-validate` must report `clean`, and `/implement` runs each SI red → green → refactor (production *and* tests), stopping between SIs so you can `/compact` and resume.

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

- **Stages are skills, not slash commands.** Each command is `$thasmorato-skills:tm-<command>` (`/plan` is `$thasmorato-skills:tm-plan`). Codex has its own `/review`, `/plan` and `/init`; those are not this plugin.
- **Stages never fire on their own.** Every `tm-*` skill is closed to implicit invocation; only the owner typing its name runs it. The reference skills (`testing`, `tdd`, `security`, `code-smells`, `clean-code`, `architecture`, `data-access`, `domain-model`, `ui`, `asking`) stay open, as in Claude Code.
- **"Never edits" is an instruction, not a sandbox.** Codex ignores a subagent's `sandbox_mode`, so the review lenses are read-only only because they are told to be. Run the session read-only when that has to hold.
- **At most six subagents run together** (Codex's default `agents.max_concurrent_threads_per_session`); `tm-review` runs its lenses in batches.
- **Codex reads `AGENTS.md`, not `CLAUDE.md`.** A project that keeps its instructions in `CLAUDE.md` can add `project_doc_fallback_filenames = ["CLAUDE.md"]` to its Codex config.

The Codex package in `codex/` is generated: edit the source, then run `node scripts/build-codex.mjs`.

## Commands

| Stage | Commands |
|---|---|
| Orchestration | `/flow` |
| Brownfield analysis | `/analyze` · `/audit-deps` |
| Requirements | `/interview` · `/questionnaire` · `/research` |
| Documentation | `/prd` · `/hld` · `/fdd` · `/doc-validate` |
| Architecture | `/components` · `/decompose` · `/boundaries` · `/reconcile` |
| Diagrams | `/c4-generate` · `/mermaid-generate` |
| Decisions (ADR) | `/adr-identify` · `/adr-generate` · `/adr-link` |
| Standards | `/guidelines` · `/generate-stack-guide` · `/generate-test-guide` · `/guardrails` |
| Development | `/tickets` · `/tickets-validate` · `/ui-audit` · `/ui-design` · `/design` · `/prototype` · `/plan` · `/plan-validate` · `/implement` · `/trim` · `/review` · `/tidy` · `/acceptance` · `/walkthrough` · `/pr` · `/diagnose` |
| Looking back | `/retro` · `/session-analyze` · `/flow-report` |
| Learning | `/teach` |
| Session | `/wait-what` · `/handoff` |
| Writing | `/writing-fragments` · `/writing-beats` · `/writing-shape` |

## Structure

| Folder | Role |
|---|---|
| `skills/` | Skills (model-invoked / interactive): run in the main context. Doc/design (`interview`, `domain-model`, `ticket-design`), the dev loop (`ticket-plan`, `plan-validate`, `tdd`, `implement`), verification (`doc-validate`, `tickets-validate`), the learning loop (`retro`), generators (`generate-test-guide`, `generate-stack-guide`), and self-contained references (`testing`, `code-smells`, `clean-code`, `architecture`, `security`, `data-access`, `ui`) |
| `commands/` | User entrypoints (`/flow`, `/interview`, `/prd`…) |
| `agents/` | Heavy generation and review subagents (isolated context, parallelizable) |
| `templates/` | Canonical skeleton per artifact (generation scaffold + handoff anchor + gate checklist) |
| `codex/` | The Codex package, **generated** from the folders above by `scripts/build-codex.mjs`; never edited by hand. `.agents/plugins/marketplace.json` points Codex at it |
| `adapters/codex/` | The little that exists only in Codex: the `tm-setup` skill |
| `scripts/` | The few things that have to be code: the session-transcript extractor behind `/session-analyze`, the Codex build and its agent installer, and the plugin's own consistency tests. Node standard library only, no dependencies; run the tests with `node --test scripts/*.test.mjs` |
| `docs/anatomy/` | Authoring standards (skill/command/agent/plugin anatomy) |

## Design principles

Software-engineering concepts apply to building AI workflows, and the suite is designed with them on purpose:

- **Deep modules.** A skill is a lot of knowledge behind one name: `code-smells` is thirty files and a single interface.
- **Interface segregation, with attention as the currency.** Loading 1,500 lines to use 20 is depending on what you don't use. Hence routers with lazy detail: `docs/guidelines.md` is an index, not a manual.
- **Derived state, no write coupling.** `/flow` reads artifacts; no subcommand owes an update to a document that isn't its own, so every stage runs standalone.
- **Overloaded definitions.** Load-bearing terms are defined twice, on different axes; the boundary contract says the same rule in prose and as a graph. Two representations of one intent make a contradiction detectable.
- **Dual audience.** Every document above the ticket is executable by a person and by an agent; below it, the bar is auditability rather than executability.

## Pattern references
Skills were re-authored here following these as models (not as dependencies):
- [mattpocock/skills](https://github.com/mattpocock/skills): grilling, to-spec, to-tickets, domain-modeling, tdd, code-review; and in v0.6, diagnosing-bugs, retro, writing-for-agents, codebase-design, improve-codebase-architecture (the HTML report), pr (itself crediting Dex Horthy's show-me, Humanlayer), prototype, teach, to-questionnaire, wait-what, handoff, setup-pre-commit, git-guardrails-claude-code, and the writing-fragments / beats / shape trio.
- UI and UX, in v0.6.1 (`/ui-audit`, `/ui-design`, `ui-critic`): Jakob Nielsen's [10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) and NN/g's heuristic-evaluation and severity method; [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (critique, audit, shape, new-work, operate, harden, clarify; Apache-2.0); [anthropics/skills](https://github.com/anthropics/skills) frontend-design (Apache-2.0); [emilkowalski/skill](https://github.com/emilkowalski/skill) break-ui and motion (MIT); [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) (MIT); [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) redesign audit (MIT); [google-labs-code/design.md](https://github.com/google-labs-code/design.md) (Apache-2.0); and [Laws of UX](https://lawsofux.com/) by Jon Yablonski, paraphrased.
- Product thinking, in v0.6.2 (beta): Drew Hoskins, *The Product-Minded Engineer* (O'Reilly, 2025): guiding scenarios carried from the brief to acceptance, shoe-shifting and strawman users, thesis and antithesis, nonpersonas, requirements as a use-case compendium, the first milestone as one complete scenario, non-functional requirements seen from the user's side, actionable errors and shifting them left, affordances sorted green, yellow and red and signaled to match (signifiers, v0.6.3), the rule of three, and customer discovery interviews. Rewritten here, paraphrased.
- [devfullcycle/claude-mkt-place](https://github.com/devfullcycle/claude-mkt-place): adrs-management, diagrams-generator, development-guidelines, project-analizer.
