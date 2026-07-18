---
name: design
description: Design the node map for a piece of work before coding — deep modules behind small interfaces at clean seams. Use before implementing a ticket, or when designing/improving a module's interface.
---

Before writing code, build the **node map** — the design contract.

- **Classify** what's being built. Map the nodes: the modules, their interfaces, and the seams. A **module** is anything with an interface + implementation (function, class, package, slice).
- Design **deep modules**: a lot of behavior behind a **small interface**, placed at a clean **seam** (a place where you can change behavior without editing in place, and test through the interface). Avoid **shallow** modules (interface nearly as complex as the implementation).
- The **interface** is everything a caller must know: signature, invariants, ordering, error modes, required config, performance — not just the type.
- **Discover existing primitives and patterns first** — reuse before adding. Respect the ADRs (`docs/adr/`) and guidelines (`docs/guidelines.md`) in the area you're touching; use `CONTEXT.md`'s vocabulary.
- **Review the map for completeness** and **confirm uncertain decisions with the user** before coding.

The node map is the authoritative contract between design and code — every implementation decision traces back to it.
