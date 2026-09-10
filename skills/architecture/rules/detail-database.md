> Part of the `architecture` skill. Details.

# The database is a detail

The database is a **utility for accessing data**, and utilities are the outermost circle. The business rules care about data — entities, relationships, invariants — and not about tables, rows, indexes, or which engine is running. The moment the schema's shape reaches the policy, the schema's lifetime becomes the policy's lifetime.

## What the policy is allowed to know
- Data **structures** it owns: the entities and the simple shapes it passes across boundaries.
- Nothing about persistence: no tables, no SQL, no ORM types, no annotations on domain objects, no lazy-loading semantics, no transaction API.

## Where the knowledge belongs
Behind a gateway interface the policy declares (`OrderRepository`, `find`, `save`) and an outer component implements. Row-to-entity conversion happens on the outer side, and what comes back across the boundary is the policy's own type — never a live ORM object, which drags the whole persistence model in behind it.

## The tell
- Domain types carrying persistence annotations or inheriting a framework base class.
- Use cases building queries, or accepting query objects.
- A repository interface whose methods mirror SQL (`findByColumnXOrderByY`) rather than the policy's questions (`activeSubscriptionsFor`).
- A "unit test" of a business rule that needs a database.

## The caveat
This is about **source-code dependency**, not about pretending the database is unimportant. Data modelling is a serious design activity, performance characteristics are real, and choosing the engine is a genuine ADR. The rule is only that the policy must not be *shaped* by that choice — which is what makes changing the choice possible at all.
