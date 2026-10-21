> Part of the `architecture` skill (see `../SKILL.md`).

# Deep modules: the vocabulary, at any scale

The rest of this skill works above the class. This file works at **every** scale, from a function to a service, because the question it answers is the same at each: does this unit hide more than it costs to learn? Use these words exactly when proposing or judging a structure; a shared word is what lets a trim, a tidy, a design and a review agree on what they are looking at.

## The words
- **Module**: anything with an interface and an implementation. A function, a class, a package, a vertical slice across tiers. Deliberately scale-free.
- **Interface**: **everything a caller must know** to use the module correctly. The signature, and also its invariants, ordering constraints, error modes, required configuration and performance characteristics. A TypeScript `interface` or a class's public methods are only the typed part of it.
- **Implementation**: what is inside: the code the caller does not have to read.
- **Depth**: how much behavior a caller (or a test) gets per unit of interface it has to learn. **Deep**: a lot behind a little. **Shallow**: the interface is nearly as complex as what it does (`code-smells` → `shallow-module` is the smell).
- **Seam**: a place where behavior can be changed without editing code at that place; the location where an interface lives. Where to put the seam is its own decision, separate from what goes behind it. A component **boundary** (`rules/boundaries.md`) is a seam at component scale.
- **Adapter**: a concrete thing that fills a seam: the Postgres repository, the in-memory fake, the HTTP client. The word names a role, not a size.
- **Leverage**: what callers get from depth: one implementation pays back across every call site and every test.
- **Locality**: what maintainers get from depth: a change, a bug and its fix live in one place instead of across the callers.

## The tests
- **The deletion test.** Imagine deleting the module and inlining it into its callers. If the complexity disappears, it was a pass-through and the deletion is the improvement. If the same complexity reappears in each caller, the module was earning its keep.
- **One adapter is a hypothetical seam; two make it real.** An interface with a single implementation, and no test that substitutes it, is indirection with nothing varying across it. The second adapter is usually the test's fake; a seam is justified when something actually varies across it (production and test, two providers, two storage engines).
- **The interface is the test surface.** Callers and tests cross the same seam. A test that needs to reach past the interface (a private method, an internal collaborator, a side channel such as querying the table directly) says the module has the wrong shape, not that the test needs more access.
- **Depth belongs to the interface, not the implementation.** A deep module may be built from small parts with their own **internal seams**, used by its own tests; those stay out of the interface. Exposing an internal seam because a test uses it makes the module shallower.

## Deepening, by what the module depends on
How a deepened module is tested across its seam depends on what sits behind it:

| Dependency | Example | How the deep module is tested |
|---|---|---|
| **In process** | pure computation, in-memory state | merge the shallow parts and test the new interface directly; no adapter |
| **Local stand-in exists** | an embedded or in-memory database, a temp filesystem | the stand-in runs in the suite; the seam stays internal |
| **Remote, owned by us** | an internal service, a queue | a port at the seam; production gets the network adapter, tests an in-memory one |
| **Remote, third party** | a payment provider, an email API | a port at the seam; tests get a fake adapter (the `testing` skill covers fakes and mocks) |

**Replace, don't layer.** When shallow modules are merged into a deep one, their unit tests become waste once tests at the new interface cover the behavior: delete them, rather than keeping two layers of tests on one behavior. A deepening that adds a wrapper over the shallow modules instead of absorbing them has added a layer, not depth.

## Who uses this
- `trim`'s **footprint** criterion: an interface or layer with one implementation and no test that substitutes it fails the two-adapter test; a module that passes the deletion test as a pass-through is a cut.
- `tdd`, when the shape of the interface under test is itself in question (how deep, where the seam goes, what it exposes).
- `visuals` and the HTML report: a proposal's gains are stated in these words ("locality: the pricing rules live in one module", "leverage: one interface, four call sites").
