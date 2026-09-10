# agents/

Subagents that run in an **isolated context**: they cannot see the conversation, they are **parallelizable**, and they receive everything through files. Two families:

**Generation** — one artifact each, from the templates: `prd-writer`, `hld-writer`, `component-mapper`, `decomposer`, `fdd-writer`, `boundary-architect`, `adr-analyzer`, `adr-generator`, `adr-linker`, `c4-generator`, `mermaid-generator`, `guideline-generator`, `researcher`, `source-reader`.

**Analysis and review** — read-only, reporting only: `architectural-analyzer`, `component-analyzer`, `dependency-auditor`, and the six `review-*` lenses fanned out by `/review`.

The `review-*` agents are deliberately narrow. A narrow lens can be held to *"every rule, against every changed hunk"* — a bar no agent doing five jobs can meet. The cost is precision: each is primed to find its own subject, so every finding must carry a **named rule** and a **concrete failure scenario**, and `/review`'s synthesis step drops the ones that don't.

How to write one: [`docs/anatomy/agent-anatomy.md`](../docs/anatomy/agent-anatomy.md).
