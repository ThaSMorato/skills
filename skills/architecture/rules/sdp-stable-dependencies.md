> Part of the `architecture` skill. Component coupling.

# SDP — Stable Dependencies Principle

**Depend in the direction of stability.**

A component is **stable** when a lot depends on it and it depends on little — changing it is expensive, so it resists change. It is **unstable** when it depends on much and nothing depends on it — it is cheap to change, which is a virtue, not a defect. SDP says a component should only depend on components at least as stable as itself.

Violating it puts a volatile component underneath a stable one: now the stable component cannot keep its promise, because the ground under it moves.

## The tell
- A component that everything imports reaches out to something that changes weekly.
- A "core" or "shared" component that imports a driver, a client SDK, or a UI concern.

## What to do
Compute the instability of both ends (`metrics.md`); if the arrow points from stable to unstable, **invert it**. Put the interface the stable component needs *inside* the stable component, and let the volatile one implement it. The volatile side now depends on the stable side, which is the direction the principle wants.

Some components are *meant* to be unstable — that is where change is supposed to be easy. The design goal is not "make everything stable"; it is "make sure nothing stable rests on something volatile".

## The caveat
Stability here is about **incoming and outgoing dependencies**, not about how often the file actually changes. The metric is a proxy; when it disagrees with the observed change history, the history wins and the graph is telling you the packaging is wrong.
