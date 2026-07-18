---
description: Drive the full Doc-Dev flow end to end, with human gates — interview → docs → tickets → dev.
argument-hint: <feature/project goal> [--brownfield]
---

Drive the Doc-Dev flow for: $ARGUMENTS

You are the **coordinator**: run the stages in order, **stop at each gate** for the user, and delegate the heavy work to the commands/agents. Never skip a gate — AI drafts, the human validates.

## Brownfield first (if `--brownfield`, or an existing codebase)
Run `/analyze` (and `/audit-deps`) so the docs are grounded in the real system.

## Phase 1 — Documentation
1. `/interview` → requirements brief + glossary + inline ADRs. **GATE (ambiguity):** don't proceed until the user confirms the shared understanding.
2. Optional `/research` (background/AFK) for open technical questions → feeds the next steps.
3. `/prd`. **GATE (strong):** the user approves the PRD before the HLD — a wrong PRD contaminates everything below.
4. `/hld` (+ `/c4-generate` for C1/C2). **GATE (strong):** the user approves the architecture.
5. `/fdd <feature>` per feature (+ `/mermaid-generate`, C3/C4). **GATE (per feature, medium).** Independent features can be specced in parallel.
6. `/adr-identify` → present the Potential ADRs → user confirms → `/adr-generate` → `/adr-link`.
7. `/guidelines <language>` once per project (skip if already present).

## Phase 2 — Development (per frontier ticket)
8. `/tickets <feature>` → vertical slices with blocking edges. The **frontier** = tickets whose blockers are all done.
9. For each frontier ticket: `/design` (node map) → **GATE** (confirm uncertain decisions) → `/implement` (TDD at pre-agreed seams) → `/review <fixed-point>` → **GATE** (the user decides what to fix).
   - **Fan-out:** run frontier tickets in parallel ONLY when they touch **disjoint files**; cap ~4 concurrent; anything sharing files or with unmet blockers stays serial. When unsure, go serial.
   - **Back-edge:** if implementation surfaces a real architectural decision, run `/adr-identify` (or add the ADR) and update the FDD before continuing — keep the docs live.

Report progress after each stage. The user can stop, redirect, or jump stages at any gate.
