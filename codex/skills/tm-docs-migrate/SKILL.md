---
name: tm-docs-migrate
description: "Move a project's docs from the layout before 0.7.0 (one document per task) to the living docs (one folder per feature), with the owner confirming the map first. Temporary; leaves the plugin when no project needs it."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): (optional) the effort slug for the brief and the decomposition being moved


Move this project's documents to the living layout: the system's state in `docs/product/`, `docs/architecture/` and one folder per feature in `docs/features/<feature>/`; what belongs to one effort in `.scratch/<effort>/`. Effort slug, if given: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

**Temporary.** This command exists for projects written before 0.7.0, and leaves the plugin once none is left. It moves and splits files, moves the sections that now belong to an effort, and rewrites references to them; it does not rewrite what a document says.

## Preflight
The working tree is clean (`git status --porcelain` prints nothing), so the migration is one reviewable change: if it is not, stop and say so. Find the old paths; when none exists, say the project is already on the living layout, and stop.

## 1. Find what is there
| Old path | New path |
|---|---|
| `docs/requirements-brief.md` | `.scratch/<effort>/brief.md` |
| `docs/prd.md` | `docs/product/prd.md` |
| `docs/design-system.md` | `docs/product/design-system.md` |
| `docs/hld.md`, `docs/components.md`, `docs/boundaries.md` | `docs/architecture/hld.md`, `components.md`, `boundaries.md` |
| `docs/c4/system-*` | `docs/architecture/c4/system-*` |
| `docs/features.md` | split: `docs/features/README.md` (the index) and `.scratch/<effort>/decomposition.md` (the effort's cut) |
| `docs/fdd/<slug>.md` | `docs/features/<feature>/fdd.md` |
| `docs/diagrams/<slug>.md` | `docs/features/<feature>/diagrams/flows.md` |
| `docs/c4/<slug>-c3.puml`, `-c4.puml`, `-analysis.md` | `docs/features/<feature>/diagrams/c3.puml`, `c4.puml`, `c4-analysis.md` |
| `docs/ui/<screen>.md` and `docs/ui/<screen>/` | `docs/features/<feature>/ui/<screen>.md` and `…/ui/<screen>/` |
| the PRD's `First milestone`, `Acceptance criteria` and its RFs' milestone tags | `.scratch/<effort>/scope.md` |
| each FDD's `Acceptance criteria` | `.scratch/<effort>/criteria/<feature>.md` |

`CONTEXT.md`, `docs/adr/` and the rest of `docs/` stay where they are.

## 2. Propose the map, then wait
The hard part is the FDDs: before 0.7.0 an FDD was often written **per task**, named after the task, so two FDDs can describe one feature. For every file under `docs/fdd/`, read its Feature id and its title and propose the feature it belongs to: the `docs/features.md` row its id points at, or, with no id, the feature whose scope it extends. Do the same for every diagram and screen spec. Show the whole map as one table (old path, new path, why), every `> Assumed:` marked, and the effort slug for the brief and the decomposition (the argument, or one built from the PRD's title, as a question).

When more than one FDD maps to one feature, ask which becomes `fdd.md`; the others move to `docs/features/<feature>/legacy/<old-slug>.md`, listed as merges pending for `$thasmorato-skills:tm-fdd <feature>` to fold in. Nothing moves until the owner approves the map.

## 3. Move
- Every move with `git mv`, so history follows the file.
- Split `docs/features.md` by `references/templates/features-index.md` and `references/templates/decomposition.md`: the feature rows, their bound, their ADRs, the retired rows and the docs folder go to the index (each feature `live` if its tickets are done, else `planned`); the epics, the order, the dependency edges, the milestones and the coverage go to the decomposition. A column with no home in either is reported, never dropped.
- Move the effort's sections out of the living documents, by `references/templates/scope.md` and `references/templates/criteria.md`: the PRD's milestone, its acceptance criteria and the RFs' milestone tags to the scope (every RF listed as `adds`, since the effort built the system up to now); each FDD's criteria, verbatim, to the feature's criteria file, `open` when the feature is `planned`, `delivered` when it is `live`. The FDD gets an empty `## Rules`; `$thasmorato-skills:tm-fdd <feature>` absorbs the delivered criteria. A `legacy/` FDD keeps its criteria: `$thasmorato-skills:tm-fdd` folds them.
- Relabel, without touching the text: put the callout line above every marker that has none (`> [!CAUTION]` over `> Needs Input:`, `> [!WARNING]` over `> Assumed:`, `> [!NOTE]` over `> Decided:`, the `asking` skill §4), and move the `Status` and `Level` lines of each living document's Metadata into a frontmatter with its `kind` (`references/templates/README.md`, Properties).
- Rewrite every reference to a moved path in `docs/`, `.scratch/`, `CLAUDE.md`, `AGENTS.md` and `.claude/`: paths only, never the text around them.

## Postflight
The table of what moved, the sections moved to the effort's files, the merges and absorptions pending (feature, the legacy files, the delivered criteria), the references rewritten per file, and what could not be mapped. The change is uncommitted, for the owner to review as one diff. Then the next command, which the owner runs: `$thasmorato-skills:tm-flow`, to see the project on the new layout.
