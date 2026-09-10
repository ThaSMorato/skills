> Part of the `architecture` skill. Component cohesion.

# CRP — Common Reuse Principle

**Don't force users of a component to depend on things they don't need.**

The Interface Segregation Principle, one scale up. There, depending on a fat interface meant recompiling for a method you never call. Here, depending on a fat component means being revalidated and redeployed for a class you never touch. CRP tells you more about which classes **do not belong together** than about which do.

## The tell
- A consumer upgrades the component only for a bugfix in a part it never calls — and still has to retest.
- The component bundles a rarely-used integration that drags in heavy transitive dependencies for everyone.
- Two clusters inside the component have disjoint consumers.

## What to do
Split along **consumer sets**. Classes that are reused together belong together; classes reused by different consumers belong apart. Then check the transitive cost: a dependency you inherit but never call is exactly the debt this principle is about.

## In an AI workflow
The same principle governs documents and skills, and there the currency is attention. A stage that must load a thousand-line guideline to use twenty lines of it is depending on what it does not use — which is why a router with lazy detail beats one big document.

## The caveat
CRP pushes components to be **smaller**, and every split adds a dependency edge to manage. See `cohesion-tension.md`.
