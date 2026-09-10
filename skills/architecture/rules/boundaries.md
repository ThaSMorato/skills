> Part of the `architecture` skill. Architecture.

# Boundaries — where they go, and when to draw them

A boundary separates things that **change for different reasons and at different rates**. Draw it along the axis of change, not along the technical layer — "controllers vs services" is a layering habit; "what the pricing team edits vs what the checkout team edits" is a boundary.

## When to draw it
Later than feels comfortable. The axes of change are not knowable at the start; they are revealed by the feature specs and by the first months of change. Drawing early means guessing, and a boundary in the wrong place costs more than no boundary at all — it adds indirection and still fails to absorb the change.

This is why the boundary contract in this flow is written **after** the feature specs: only then is the question answerable with evidence instead of taste.

## The two costs, both real
- **Drawing it too early or in the wrong place:** indirection, ceremony, and abstractions that serve nothing — the YAGNI failure.
- **Not drawing it, or erasing it:** the two sides fuse, and separating them later means touching everything.

Neither error is the safe default. What makes the decision tractable is deferring it until the evidence exists, and buying partial optionality in the meantime — see `partial-boundaries.md`.

## What a boundary actually is
Not a folder. A boundary is real when crossing it requires going through an **interface owned by the inner side**, and when a change on one side can be released without rebuilding the other. If neither is true, the boundary is a naming convention.

## In this suite
Boundaries are recorded in `docs/boundaries.md` as an allow-list of edges plus a manifest. That whitelist form is deliberate: an edge that is absent is forbidden, which is what makes the contract checkable at all.
