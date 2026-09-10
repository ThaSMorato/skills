> Part of the `architecture` skill. Architecture.

# Services are not architecture

Splitting a system into services is a **deployment and operational** decision. It says nothing about whether the system is decoupled, because the architectural boundaries are defined by dependencies, not by process boundaries.

Two traps follow.

## The decoupling fallacy
Services communicating over a network still share data shapes, still depend on each other's behaviour, and still change together. A cross-service call is a function call with worse failure modes and a slower feedback loop. If service A must be redeployed whenever service B's payload changes, the two are coupled — the network between them is a cost, not a boundary.

## The independent-development fallacy
"Each team owns a service" scales to a point, and the same coordination problems return as coordination *between* services: shared schemas, versioned contracts, orchestrated releases. The scaling comes from the boundary being drawn along a real axis of change, not from the service being a separate process.

## What actually decouples
The Dependency Rule, applied inside each service and across them:
- Each service holds its own policy, depending on interfaces it owns.
- Shared knowledge crosses as simple boundary structures, never as a shared internal model.
- A new variant plugs in behind an interface rather than being special-cased across services.

A well-structured monolith with real internal boundaries can be split into services later, cheaply. A service mesh with no internal boundaries cannot be fixed by adding more services.

## The practical reading
Choose services for operational reasons — independent scaling, independent deployment cadence, team autonomy, fault isolation, technology fit — and be able to state which one you are buying. Then design the boundaries separately, by axis of change, because the two decisions are genuinely independent.
