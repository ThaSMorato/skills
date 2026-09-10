> Part of the `architecture` skill. Architecture.

# The circles — what the diagram does and does not say

The concentric-circle diagram is one **illustration** of the Dependency Rule, not a required layer count and not an architecture in itself. Read outward from the centre:

| Circle | Holds | Volatility |
|---|---|---|
| **Entities** | enterprise-wide business rules and the data they operate on | lowest |
| **Use cases** | application-specific rules — the orchestration that makes the entities do something | low |
| **Interface adapters** | controllers, presenters, gateways: converting between the shapes the inner circles use and the shapes the outer world uses | high |
| **Frameworks and drivers** | the web, the database, the UI, the devices — glue code | highest |

The only rule that binds them is the Dependency Rule: names from an outer circle never appear in an inner one.

## What it does not say
- **Not "four layers".** The number of circles is illustrative. What matters is that they are ordered by volatility and that dependencies cross inward only.
- **Not a folder layout.** You can implement the rule in one directory or across a dozen packages. See `screaming-architecture.md` for how the layout should be decided.
- **Not a promise of independence for free.** The independence — of framework, of UI, of database, of external agency — is a *consequence* of holding the rule, and it evaporates the moment one inward import sneaks past.

## The shape at a boundary
Controller → (interface) → use case → (interface) → gateway. The use case sits in the middle, depending on neither side; the two outer pieces depend on interfaces the use case owns. When you can draw that shape for a feature, the feature obeys the architecture. When you cannot, no folder naming will save it.

## Testability is the tell
If the use cases can be exercised with no web server, no database, and no framework bootstrapping, the circles are real. If a "unit test" of a business rule needs the framework up, the dependency is pointing the wrong way and the diagram is decoration.
