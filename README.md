# thasmorato-skills

A Claude Code plugin implementing an **AI Doc-Dev flow**: from the requirements interview, through complete documentation and architecture, to a validated test-first development loop — importable per project (marketplace).

## The flow

`/flow` drives the whole thing. It **scans the disk first** and tells you where the project stands and what is waiting for your approval, then runs the next stage — stopping at human gates, because the AI drafts and the human validates.

```
/flow  (coordinator: scans state from artifacts, never from a status file)
 ├─ brownfield:  /analyze · /audit-deps → /guidelines (+ stack guides)
 ├─ Phase 1 — docs:
 │     /interview → /research → /prd → /hld (+/c4-generate)
 │       → greenfield: /guidelines (+ stack guides)
 │       → /components → /decompose → /fdd (+/mermaid-generate) → /boundaries
 │       → /adr-identify → /adr-generate → /adr-link
 │     with /doc-validate between each pair, before every gate
 └─ Phase 2 — dev, per frontier ticket:
       /tickets → /design → /plan → /plan-validate → /implement → /review
```

**Two architecture beats, deliberately apart.** `/components` builds the system component map *before* the feature specs, so every FDD shares one vocabulary. `/boundaries` writes the dependency contract *after* them, because the axes of change a boundary separates are only knowable once the features are specced.

**Authoring is separated from verification, in both phases.** `/plan-validate` gates the code phase with a machine-readable `clean | dirty` verdict; `/doc-validate` does the same for the doc phase, checking coverage in the direction nothing else asks about — what the source said and the target dropped.

**The dev loop is test-first and gated.** `/design` writes the node map to a file, `/plan` slices a ticket into vertical SIs, `/plan-validate` must report `clean`, and `/implement` runs each SI red → green → refactor (production *and* tests), stopping between SIs so you can `/compact` and resume.

## Install

```bash
/plugin marketplace add ThaSMorato/skills
/plugin install thasmorato-skills@thasmorato
```

Or, from a local checkout: `/plugin marketplace add <path-to-this-repo>`.

## Commands

| Stage | Commands |
|---|---|
| Orchestration | `/flow` |
| Brownfield analysis | `/analyze` · `/audit-deps` |
| Requirements | `/interview` · `/research` |
| Documentation | `/prd` · `/hld` · `/fdd` · `/doc-validate` |
| Architecture | `/components` · `/decompose` · `/boundaries` |
| Diagrams | `/c4-generate` · `/mermaid-generate` |
| Decisions (ADR) | `/adr-identify` · `/adr-generate` · `/adr-link` |
| Standards | `/guidelines` · `/generate-stack-guide` · `/generate-test-guide` |
| Development | `/tickets` · `/design` · `/plan` · `/plan-validate` · `/implement` · `/review` |
| Looking back | `/retro` |

## Structure

| Folder | Role |
|---|---|
| `skills/` | Skills (model-invoked / interactive) — run in the main context. Doc/design (`interview`, `domain-model`, `design`), the dev loop (`plan`, `plan-validate`, `tdd`, `implement`), verification (`doc-validate`), the learning loop (`retro`), generators (`generate-test-guide`, `generate-stack-guide`), and self-contained references (`testing`, `code-smells`, `clean-code`, `architecture`, `security`) |
| `commands/` | User entrypoints (`/flow`, `/interview`, `/prd`…) |
| `agents/` | Heavy generation and review subagents (isolated context, parallelizable) |
| `templates/` | Canonical skeleton per artifact (generation scaffold + handoff anchor + gate checklist) |
| `docs/anatomy/` | Authoring standards (skill/command/agent/plugin anatomy) |

## Design principles

Software-engineering concepts apply to building AI workflows, and the suite is designed with them on purpose:

- **Deep modules.** A skill is a lot of knowledge behind one name — `code-smells` is thirty files and a single interface.
- **Interface segregation, with attention as the currency.** Loading 1,500 lines to use 20 is depending on what you don't use. Hence routers with lazy detail: `docs/guidelines.md` is an index, not a manual.
- **Derived state, no write coupling.** `/flow` reads artifacts; no subcommand owes an update to a document that isn't its own, so every stage runs standalone.
- **Overloaded definitions.** Load-bearing terms are defined twice, on different axes; the boundary contract says the same rule in prose and as a graph. Two representations of one intent make a contradiction detectable.
- **Dual audience.** Every document above the ticket is executable by a person and by an agent; below it, the bar is auditability rather than executability.

## Pattern references
Skills were re-authored here following these as models (not as dependencies):
- [mattpocock/skills](https://github.com/mattpocock/skills) — grilling, to-spec, to-tickets, domain-modeling, tdd, code-review.
- [devfullcycle/claude-mkt-place](https://github.com/devfullcycle/claude-mkt-place) — adrs-management, diagrams-generator, development-guidelines, project-analizer.
