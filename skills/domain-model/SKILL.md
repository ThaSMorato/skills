---
name: domain-model
description: Build and sharpen the domain model as you design — a glossary (ubiquitous language) and ADRs written the moment they crystallize. Use when changing the model, not just reading it.
---

As you design, actively sharpen the domain:

- Challenge terms that conflict with the current glossary (`CONTEXT.md`): "your glossary says X, but you seem to mean Y — which is it?"
- Sharpen vague or overloaded language by proposing the canonical term ("you say 'account' — Customer or User?").
- Invent edge-case scenarios to force precision on the boundaries between concepts.
- Cross-reference the code and memory; if they contradict what was said, surface it.
- Update `CONTEXT.md` inline the moment a term resolves — a pure glossary, with NO implementation detail.
- Offer an ADR sparingly — only when all three are true (the 3-Es rule): **structural** (hard to reverse), **evident** (surprising without context), **stable** (a real trade-off). If any is missing, skip it.
