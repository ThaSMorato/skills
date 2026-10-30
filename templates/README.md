# templates/

**Canonical skeletons** per artifact. An agent **fills** the skeleton instead of inventing structure.

| Template | Filled by | Produces |
|---|---|---|
| `requirements-brief.md` | `/tm-interview` | `.scratch/<effort>/brief.md` |
| `context.md` | `domain-model` skill | `CONTEXT.md` |
| `research-report.md` | `researcher` | `docs/research/<slug>.md` |
| `library-reference.md` | `ticket-design`, `ticket-plan`, `researcher`, `generate-stack-guide` | `docs/research/libraries/<library>@<version>.md` |
| `prd.md` | `prd-writer` | `docs/product/prd.md`, or `docs/features/<feature>/prd.md` at `Level: feature` |
| `decision-map.md` | `/tm-decision-map` | `.scratch/<effort>/decision-map.md` |
| `scope.md` | `prd-writer` | `.scratch/<effort>/scope.md` |
| `hld.md` | `hld-writer` | `docs/architecture/hld.md` |
| `components.md` | `component-mapper` | `docs/architecture/components.md` |
| `features-index.md` | `decomposer` | `docs/features/README.md` |
| `decomposition.md` | `decomposer` | `.scratch/<effort>/decomposition.md` |
| `fdd.md` | `fdd-writer` | `docs/features/<feature>/fdd.md` |
| `criteria.md` | `fdd-writer` | `.scratch/<effort>/criteria/<feature>.md` |
| `feature-readme.md` | `fdd-writer` | `docs/features/<feature>/README.md` |
| `boundaries.md` | `boundary-architect` | `docs/architecture/boundaries.md` |
| `adr.md` | `adr-generator` | `docs/adr/NNNN-<slug>.md` |
| `guidelines.md` | `guideline-generator` | `docs/guidelines.md` (a **router**, ≤150 lines) |
| `parallel-sessions.md` | `guideline-generator` | `docs/parallel-sessions.md` (how a second session runs at once: ports, database, env file, `.scratch`) |
| `ui-spec.md` | `/tm-ui-design` | `docs/features/<feature>/ui/<screen>.md` |
| `design-system.md` | `/tm-ui-design` (only when the project has a design system) | `docs/product/design-system.md` |
| `ticket.md` | `/tm-tickets` | `.scratch/<feature>/issues/<NN>-<slug>.md` |
| `e2e-spec.md` | `/tm-plan`, when the repo has an E2E runner | `.scratch/<feature>/plans/<NN>-<slug>/e2e.md` |
| `system-profile.md` | `architectural-analyzer` | `docs/analysis/system-profile.md` |
| `declined.md` | `/tm-tidy`, `/tm-trim`, `/tm-review` (append-only) | `docs/declined.md` |
| `component-analysis.md` | `component-analyzer` | `docs/analysis/components/<component>.md` |
| `dependency-graph.md` | `architectural-analyzer` (read by `reconciler`) | `docs/analysis/dependency-graph.md` |
| `retro.md` | `/tm-retro` | `docs/retro/<scope>.md` |
| `evolutions.md` | `/tm-retro`, `decomposer` (append-only) | `docs/evolutions.md` |
| `meta-retro.md` | `/tm-session-analyze` | `docs/meta-retro/<date>-<session>.md` |
| `flow-report.md` | `/tm-flow-report` | `docs/flow-reports/<date>.md` |

Triple duty: (a) generation **scaffold**, (b) **handoff anchor** between isolated agents (known sections), (c) **gate/review checklist**.

Rules: **self-contained** (no external links); sections marked **required × optional**; the agent **prunes + renumbers** what doesn't apply; a skeleton = headers + one line of intent per section, **not** a heavy example.

**Properties.** A living document (PRD, HLD, components, boundaries, the feature index, a feature's README and FDD) and an ADR start with a YAML frontmatter: `kind`, `status`, and `level` or `feature` where they apply. Obsidian's Bases filters on them, and `/tm-flow` reads `status` there. The template's leading comment is instructions, never copied: the filled document **starts** with its frontmatter. A document from before 0.7.0 carries Status and Level as Metadata lines; read them there. The effort's files (brief, scope, decomposition, criteria) keep them in Metadata.

Three fields are read by other stages, so they are contracts rather than decoration:

- **`status: draft | in review | approved | changes-requested`**: the gate record. Whoever runs the gate writes it; `/tm-flow` reads it to report what is waiting on the user. Nobody else may set it to `approved`.
- **`level: product | module (EPIC) | feature`**: sets the depth of the document, and propagates brief → PRD → HLD → FDD.
- **Numbered ids** (`RF-001`, `AC-1`, `SI-1`): what makes coverage checks mechanical instead of textual.

**Living or temporary.** The templates that fill `docs/product/`, `docs/architecture/` and `docs/features/` produce **living** documents: each effort amends them in place, by section, and none carries an acceptance criterion or a milestone (`skills/doc-validate/living.md`). The ones that fill `.scratch/` (brief, scope, decomposition, criteria, tickets) belong to one effort and go with it.
