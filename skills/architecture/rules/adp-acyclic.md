> Part of the `architecture` skill. Component coupling.

# ADP — Acyclic Dependencies Principle

**Allow no cycles in the component dependency graph.**

This principle has no SOLID equivalent, because it only exists once there is a graph. A cycle means the components in it can no longer be built, tested, or released independently: they have silently fused into one larger component with none of the benefits.

## The tell
- "Nothing builds until everything builds."
- A change in a leaf component forces a retest of something it should know nothing about.
- Two components import each other, directly or through a chain — the chain is the part people miss, and it is why this is a graph computation, not an eyeball check.

## What to do
Detect first: cycles are found by walking the import graph, not by judgement. See `metrics.md`. Then break the cycle one of two ways:

1. **Invert a dependency (DIP).** Put an interface in the component that is being depended upon, and have the other side implement it. The call still goes one way; the source dependency now points the other.
2. **Extract a new component.** Move the classes both sides need into a component both may depend on.

## The caveat
Cycles appear naturally as a system grows — the graph is not designed once, it is **maintained**. Expect to break a new one every so often; treat a recurring cycle between the same pair as evidence the boundary between them is wrong.
