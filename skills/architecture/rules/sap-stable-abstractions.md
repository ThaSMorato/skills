> Part of the `architecture` skill. Component coupling.

# SAP — Stable Abstractions Principle

**A component should be as abstract as it is stable.**

SDP says the stable side must not depend on the volatile side. But something has to hold the high-level policy — the part that *should* be hard to change and yet must still be extensible. SAP resolves that: make the stable component **abstract**, so it can be extended without being modified. This is the Open-Closed Principle expressed in packaging.

Together, SDP and SAP are the Dependency Inversion Principle at component scale — but stated in **degrees** rather than as a binary.

## The tell
- A highly depended-upon component that is full of concrete classes: it is rigid, and every extension means editing it.
- A component nobody depends on that is all interfaces: abstraction nobody uses.

## What to do
For each stable component, ask what a new variant would require. If it would mean editing existing classes, the component needs abstractions — interfaces, abstract policies, plug points — that the volatile components implement. See `plugin-architecture.md` for the shape this takes.

## The caveat
Not everything stable must be abstract. Non-volatile concrete things — the standard library, a string utility, a well-settled value type — are safe to depend on precisely because they are not going to change. The principle targets components carrying **policy that will need to vary**, not every stable thing.
