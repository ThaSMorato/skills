---
name: design
description: Design the node map for a piece of work before coding — deep modules behind small interfaces at clean seams — and persist it as the design contract. Use before implementing a ticket, or when designing/improving a module's interface.
disable-model-invocation: true
---

Before writing code, build the **node map** — the design contract — and write it down.

## 1. Inputs
Read, in this order:
- **The ticket** (`.scratch/<feature-slug>/issues/<NN>-<slug>.md`) — what is being built, its acceptance criteria, its exclusions, its seam. One ticket per fresh context, so it will not already be in view.
- **The FDD** it names — the public contracts, the declared test seams, the error and concurrency behavior.
- `docs/analysis/components/*.md` (if present) — the existing primitives in the components this work touches. This is the file that answers "what already exists" before you design something new.
- `docs/boundaries.md` (if present) — which components this work may touch and which dependency edges are legal.
- `docs/adr/*.md` and `docs/guidelines.md` — binding in the area you're touching; load the stack guide the router names for the files involved.
- `CONTEXT.md` — the vocabulary.

## 2. Build the map
- **Classify** what's being built. Map the nodes: the modules, their interfaces, and the seams. A **module** is anything with an interface + implementation (function, class, package, slice).
- Design **deep modules**: a lot of behavior behind a **small interface**, placed at a clean **seam** (a place where you can change behavior without editing in place, and test through the interface). Avoid **shallow** modules (interface nearly as complex as the implementation).
- The **interface** is everything a caller must know: signature, invariants, ordering, error modes, required config, performance — not just the type.
- **Discover existing primitives and patterns first** — reuse before adding.
- Place each node in a **component**, and check that every dependency it introduces is an allowed edge in the boundary contract. An illegal edge found here costs a rethink; found in review it costs a rewrite.

## 3. Check completeness against the ticket
The map is complete when **every acceptance criterion in the ticket has a node that satisfies it**. Walk the ACs by id and name the node for each. An AC with no node is the gap this check exists to find; a node serving no AC is either scope creep or a missing AC.

## 4. Confirm, then persist
Present the map and **confirm uncertain decisions with the user** before coding.

Then write it to `.scratch/<feature-slug>/design/<NN>-<slug>.md`:

```markdown
---
kind: node-map
slug: <NN>-<slug>
ticket: .scratch/<feature-slug>/issues/<NN>-<slug>.md
---

# Node map — <NN> <Ticket title>

## Nodes
### <node name>
- **Kind:** function | class | module | package | slice
- **Component:** <from docs/components.md>
- **Interface:** <signature, invariants, ordering, error modes, config, performance>
- **Depth:** <what it hides>
- **Reuses:** <existing primitives, or `new`>

## Seams
<where tests attach, and which FDD seam each corresponds to>

## New dependency edges
| From | To | Allowed by boundaries.md |
|---|---|---|

## AC coverage
| Ticket AC | Node that satisfies it |
|---|---|

## Open decisions
<anything confirmed with the user, and anything still uncertain>
```

The node map is the authoritative contract between design and code — every implementation decision traces back to it. **That is only true if it exists as a file.** Left in the conversation it dies at the next `/compact`, it is invisible to `/flow`'s scan, `/plan-validate` cannot check the plan against it, and `/review` can only reach the design decisions the plan happened to capture.
