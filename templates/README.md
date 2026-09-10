# templates/

**Canonical skeletons** per artifact. An agent **fills** the skeleton instead of inventing structure.

| Template | Filled by | Produces |
|---|---|---|
| `requirements-brief.md` | `/interview` | `docs/requirements-brief.md` |
| `context.md` | `domain-model` skill | `CONTEXT.md` |
| `research-report.md` | `researcher` | `docs/research/<slug>.md` |
| `prd.md` | `prd-writer` | `docs/prd.md` |
| `hld.md` | `hld-writer` | `docs/hld.md` |
| `components.md` | `component-mapper` | `docs/components.md` |
| `features.md` | `decomposer` | `docs/features.md` |
| `fdd.md` | `fdd-writer` | `docs/fdd/<feature>.md` |
| `boundaries.md` | `boundary-architect` | `docs/boundaries.md` |
| `adr.md` | `adr-generator` | `docs/adr/NNNN-<slug>.md` |
| `guidelines.md` | `guideline-generator` | `docs/guidelines.md` (a **router**, ≤150 lines) |
| `ticket.md` | `/tickets` | `.scratch/<feature>/issues/<NN>-<slug>.md` |
| `system-profile.md` | `architectural-analyzer` | `docs/analysis/system-profile.md` |

Triple duty: (a) generation **scaffold**, (b) **handoff anchor** between isolated agents (known sections), (c) **gate/review checklist**.

Rules: **self-contained** (no external links); sections marked **required × optional**; the agent **prunes + renumbers** what doesn't apply; a skeleton = headers + one line of intent per section, **not** a heavy example.

Three fields are read by other stages, so they are contracts rather than decoration:

- **`Status: draft | in review | approved | changes-requested`** — the gate record. Whoever runs the gate writes it; `/flow` reads it to report what is waiting on the user. Nobody else may set it to `approved`.
- **`Level: product | module (EPIC) | feature`** — sets the depth of the document, and propagates brief → PRD → HLD → FDD.
- **Numbered ids** (`RF-001`, `AC-1`, `SI-1`) — what makes coverage checks mechanical instead of textual.
