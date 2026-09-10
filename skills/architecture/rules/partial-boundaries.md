> Part of the `architecture` skill. Architecture.

# Partial boundaries

A full boundary is expensive: two independently releasable components, the interfaces between them, the wiring, the build and versioning setup. Sometimes you believe a boundary will be needed and cannot yet justify that cost. A **partial boundary** buys most of the optionality for a fraction of the price.

Three forms, in decreasing cost:

## 1. Skip the last step
Do all the work of a full boundary — separate the code, define the interfaces, invert the dependencies — but keep everything in **one deployable unit**. The design is separable; the packaging is not, yet. Promoting it later is a build change, not a redesign.

## 2. One-dimensional boundary
Define the interface and have the inner side depend only on it, but ship a single implementation with no wiring indirection. The seam exists; the strategy for varying it does not. Cheap to create, and the discipline to maintain is "nobody bypasses the interface".

## 3. Facade
No inversion at all: one class that the client talks to, which forwards to the services behind it. The client depends on the facade instead of on everything behind it. It gives you a single place to change later — and it gives you none of the dependency inversion, so the facade itself still knows all the implementations.

## Choosing
Pick the cheapest form that answers the question **"if I'm wrong about needing this, what did I waste?"** All three are honest positions. What is not honest is claiming a facade is a boundary — it manages coupling, it does not invert it.

## The tell that you chose wrong
- Client code reaching around the facade to the services behind it: the partial boundary has already eroded, and nothing enforced it.
- A one-dimensional boundary with a second implementation appearing: it is time to promote it to a full one.
