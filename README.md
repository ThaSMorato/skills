# thasmorato-skills

A Claude Code plugin implementing an **AI Doc-Dev flow**: from the requirements interview, through complete documentation, to development — importable per project (marketplace).

## The flow

`/flow` drives the whole thing, stopping at human gates (AI drafts, the human validates):

```
/flow  (coordinator: DAG + gates + parallel frontier)
 ├─ brownfield:  /analyze · /audit-deps
 ├─ Phase 1 — docs:  /interview → /research → /prd → /hld (+/c4-generate)
 │                    → /fdd (+/mermaid-generate) → /adr-identify → /adr-generate → /adr-link
 │                    → /guidelines
 └─ Phase 2 — dev:   /tickets → /design → /plan → /plan-validate → /implement → /review
```

Full doc chain (always), docs next to the code, per-project memory, ADRs gated by the 3-Es rule, fan-out driven by the ticket blocking graph. The dev loop is **test-first and gated**: `/plan` slices a ticket into vertical SIs, `/plan-validate` must report `clean`, and `/implement` runs each SI red → green → refactor (production *and* tests), stopping between SIs so you can `/compact` and resume.

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
| Documentation | `/prd` · `/hld` · `/fdd` · `/guidelines` |
| Diagrams | `/c4-generate` · `/mermaid-generate` |
| Decisions (ADR) | `/adr-identify` · `/adr-generate` · `/adr-link` |
| Development | `/tickets` · `/design` · `/plan` · `/plan-validate` · `/implement` · `/review` |
| Testing | `/generate-test-guide` |

## Structure

| Folder | Role |
|---|---|
| `skills/` | Skills (model-invoked / interactive) — run in the main context. Doc/design (`interview`, `domain-model`, `design`), the dev loop (`plan`, `plan-validate`, `tdd`, `implement`), and self-contained references (`testing`, `code-smells`, `clean-code`, `generate-test-guide`) |
| `commands/` | User entrypoints (`/flow`, `/interview`, `/prd`…) |
| `agents/` | Heavy generation subagents (isolated context, parallelizable) |
| `templates/` | Canonical skeleton per doc (generation scaffold + handoff anchor + gate checklist) |
| `docs/anatomy/` | Authoring standards (skill/command/agent/plugin anatomy) |

## Pattern references
Skills were re-authored here following these as models (not as dependencies):
- [mattpocock/skills](https://github.com/mattpocock/skills) — grilling, to-spec, to-tickets, domain-modeling, tdd, code-review.
- [devfullcycle/claude-mkt-place](https://github.com/devfullcycle/claude-mkt-place) — adrs-management, diagrams-generator, development-guidelines, project-analizer.
