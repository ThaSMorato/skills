---
name: domain-model
description: Build and sharpen the domain model as you design — a glossary (ubiquitous language) and ADRs written the moment they crystallize. Use when changing the model, not just reading it.
---

As you design, actively sharpen the domain:

- Challenge terms that conflict with the current glossary (`CONTEXT.md`): "your glossary says X, but you seem to mean Y — which is it?"
- Sharpen vague or overloaded language by proposing the canonical term ("you say 'account' — Customer or User?").
- Invent edge-case scenarios to force precision on the boundaries between concepts.
- Cross-reference the **codebase** and the **project's own documents** (`docs/`, prior ADRs, `docs/analysis/*`); if they contradict what was said, surface it.
- Update `CONTEXT.md` inline the moment a term resolves — a pure glossary, with NO implementation detail.
- Offer an ADR sparingly — only when all three are true (the 3-Es rule): **structural** (hard to reverse), **evident** (surprising without context), **stable** (a real trade-off). If any is missing, skip it.

## Load-bearing terms get two descriptions
A term is **load-bearing** when a later stage will act on it: it names a requirement, a component, an entity, or appears in an acceptance criterion. Those terms are worth defining twice, on **different axes**, so a definition that is wrong but internally consistent cannot cross the whole pipeline unnoticed.

Pick one pair per term:
- **by properties × by a concrete example** — "a Tenant is an isolation unit with its own data and billing" × "Acme Corp is one Tenant; Acme's Brazil office is not";
- **what it is × what it explicitly is not** — the second half is where the disagreement surfaces;
- **prose × a formal shape** — fields, types, cardinality, allowed states.

A paraphrase is not a second axis: same angle, doubled cost, nothing detected. Record both in the `Load-bearing terms` section of `CONTEXT.md`, and present them to the user together for approval — the point is detection, and a human decides which side is wrong.

Keep the count honest. Two descriptions for every noun is a tax; apply it to the terms the pipeline will act on.
