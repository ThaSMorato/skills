# thasmorato-skills

A Claude Code plugin implementing an **AI Doc-Dev flow**: from the requirements interview, through complete documentation and architecture, to a validated test-first development loop, importable per project (marketplace).

## The flow

`/tm-flow` drives the whole thing. It **scans the disk first** and tells you where the project stands and what is waiting for your approval, then runs the next stage, stopping at human gates, because the AI drafts and the human validates.

```
/tm-flow  (coordinator: scans state from artifacts, never from a status file)
 ├─ brownfield:  /tm-analyze · /tm-audit-deps → /tm-guidelines (+ stack guides)
 ├─ Phase 1 (docs):
 │     /tm-interview → /tm-research → /tm-prd → /tm-hld (+/tm-c4-generate)
 │       → greenfield: /tm-guidelines (+ stack guides)
 │       → /tm-components → /tm-decompose → /tm-fdd (+/tm-mermaid-generate) → /tm-boundaries
 │       → /tm-adr-identify → /tm-adr-generate → /tm-adr-link
 │     with /tm-doc-validate between each pair, before every gate
 └─ Phase 2 (dev, per frontier ticket):
       /tm-tickets (→ /tm-tickets-validate) → /tm-design → /tm-plan → /tm-plan-validate → /tm-implement → /tm-trim → /tm-review → /tm-tidy → /tm-acceptance → /tm-walkthrough → /tm-pr
       bug of unknown cause: /tm-diagnose → fix test-first, or a bugfix ticket → /tm-design → /tm-plan …
       structure drifts: /tm-reconcile → /tm-components · /tm-boundaries amend
```

**Two architecture beats, deliberately apart.** `/tm-components` builds the system component map *before* the feature specs, so every FDD shares one vocabulary. `/tm-boundaries` writes the dependency contract *after* them, because the axes of change a boundary separates are only knowable once the features are specced.

**Authoring is separated from verification, in both phases.** `/tm-plan-validate` gates the code phase with a machine-readable `clean | dirty` verdict; `/tm-doc-validate` does the same for the doc phase, checking coverage in the direction nothing else asks about: what the source said and the target dropped. `/tm-tickets-validate` covers the step between them: the ticket set as a whole, including the tickets that are too **small**, which no ceiling can catch.

**The dev loop is test-first and gated.** `/tm-design` writes the node map to a file, `/tm-plan` slices a ticket into vertical SIs, `/tm-plan-validate` must report `clean`, and `/tm-implement` runs each SI red → green → refactor (production *and* tests), stopping between SIs so you can `/compact` and resume.

## Install

```bash
/plugin marketplace add ThaSMorato/skills
/plugin install thasmorato-skills@thasmorato
```

Or, from a local checkout: `/plugin marketplace add <path-to-this-repo>`.

## Commands

| Stage | Commands |
|---|---|
| Orchestration | `/tm-flow` |
| Brownfield analysis | `/tm-analyze` · `/tm-audit-deps` |
| Requirements | `/tm-interview` · `/tm-questionnaire` · `/tm-research` |
| Documentation | `/tm-prd` · `/tm-hld` · `/tm-fdd` · `/tm-doc-validate` |
| Architecture | `/tm-components` · `/tm-decompose` · `/tm-boundaries` · `/tm-reconcile` |
| Diagrams | `/tm-c4-generate` · `/tm-mermaid-generate` |
| Decisions (ADR) | `/tm-adr-identify` · `/tm-adr-generate` · `/tm-adr-link` |
| Standards | `/tm-guidelines` · `/tm-generate-stack-guide` · `/tm-generate-test-guide` · `/tm-guardrails` |
| Development | `/tm-tickets` · `/tm-tickets-validate` · `/tm-ui-audit` · `/tm-ui-design` · `/tm-design` · `/tm-prototype` · `/tm-plan` · `/tm-plan-validate` · `/tm-implement` · `/tm-trim` · `/tm-review` · `/tm-tidy` · `/tm-acceptance` · `/tm-walkthrough` · `/tm-pr` · `/tm-diagnose` |
| Looking back | `/tm-retro` · `/tm-session-analyze` · `/tm-flow-report` |
| Learning | `/tm-teach` |
| Session | `/tm-wait-what` · `/tm-handoff` |
| Writing | `/tm-writing-fragments` · `/tm-writing-beats` · `/tm-writing-shape` |

## Structure

| Folder | Role |
|---|---|
| `skills/` | Skills (model-invoked / interactive): run in the main context. Doc/design (`interview`, `domain-model`, `design`), the dev loop (`plan`, `plan-validate`, `tdd`, `implement`), verification (`doc-validate`, `tickets-validate`), the learning loop (`retro`), generators (`generate-test-guide`, `generate-stack-guide`), and self-contained references (`testing`, `code-smells`, `clean-code`, `architecture`, `security`, `data-access`, `ui`) |
| `commands/` | User entrypoints (`/tm-flow`, `/tm-interview`, `/tm-prd`…) |
| `agents/` | Heavy generation and review subagents (isolated context, parallelizable) |
| `templates/` | Canonical skeleton per artifact (generation scaffold + handoff anchor + gate checklist) |
| `scripts/` | The few things that have to be code: the session-transcript extractor behind `/tm-session-analyze`, and the plugin's own consistency tests. Node standard library only, no dependencies; run the tests with `node --test scripts/*.test.mjs` |
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

## v0.7 beta: shared Claude and Codex workflows

All commands now start with `tm-`. In Claude use `/tm-review`; in Codex use `$tm-review` after installing the plugin. Wrapped core skills stay callable without filling the Claude command menu. The nine reference skills remain discoverable.

Canonical sources are `workflows/`, `agent-specs/`, core `skills/`, `policies/`, templates and `plugin-source.json`. Do not edit generated `commands/`, `agents/`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `skills/tm-*/` or `skills/*/agents/openai.yaml` by hand.

```sh
python3 scripts/build-adapters.py
python3 scripts/build-adapters.py --check
node --test scripts/*.test.mjs
node scripts/check-links.mjs docs policies README.md
```

Current-state docs live under `docs/produto/`, `docs/arquitetura/` and `docs/features/<feature>/`. ACs and plans stay in delivery artifacts under `.scratch/`; ADRs remain immutable. Existing layouts are migration inputs, never silently discarded. See the [implementation map](docs/v0.7.0-coverage.md), [behavioral evaluation](docs/evaluation.md) and [Codex adapter](adapters/codex/README.md). The beta has no live cross-model quality or cost claim.
