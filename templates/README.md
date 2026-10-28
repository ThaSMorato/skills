# templates/

**Canonical skeletons** per artifact. An agent **fills** the skeleton instead of inventing structure.

| Template | Filled by | Produces |
|---|---|---|
| `requirements-brief.md` | `/tm-interview` | `.scratch/<effort>/brief.md` |
| `context.md` | `domain-model` skill | `CONTEXT.md` |
| `research-report.md` | `researcher` | `docs/research/<slug>.md` |
| `prd.md` | `prd-writer` | `docs/product/prd.md`, or `docs/features/<feature>/prd.md` at `Level: feature` |
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
| `ui-spec.md` | `/tm-ui-design` | `docs/features/<feature>/ui/<screen>.md` |
| `design-system.md` | `/tm-ui-design` (only when the project has a design system) | `docs/product/design-system.md` |
| `ticket.md` | `/tm-tickets` | `.scratch/<feature>/issues/<NN>-<slug>.md` |
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

Three fields are read by other stages, so they are contracts rather than decoration:

- **`Status: draft | in review | approved | changes-requested`**: the gate record. Whoever runs the gate writes it; `/tm-flow` reads it to report what is waiting on the user. Nobody else may set it to `approved`.
- **`Level: product | module (EPIC) | feature`**: sets the depth of the document, and propagates brief → PRD → HLD → FDD.
- **Numbered ids** (`RF-001`, `AC-1`, `SI-1`): what makes coverage checks mechanical instead of textual.

**Living or temporary.** The templates that fill `docs/product/`, `docs/architecture/` and `docs/features/` produce **living** documents: each effort amends them in place, by section, and none carries an acceptance criterion or a milestone (`skills/doc-validate/living.md`). The ones that fill `.scratch/` (brief, scope, decomposition, criteria, tickets) belong to one effort and go with it.
