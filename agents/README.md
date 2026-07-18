# agents/

**Heavy generation** subagents (PRD/HLD/FDD/ADR/C4/guidelines/research/implement). They run in an **isolated context**, are **parallelizable**, and **don't talk live** to the user — so they receive everything via files (brief, templates) and return an artifact.

How to write one: [`docs/anatomy/agent-anatomy.md`](../docs/anatomy/agent-anatomy.md).
