> Part of the `architecture` skill. Architecture.

# The Dependency Rule

**Source-code dependencies point only inward, toward higher-level policy.**

Everything else in clean architecture is machinery for this one rule. Inner circles know nothing of outer ones: no name declared in an outer circle — no class, no function, no variable, no database table, no framework type — may be mentioned by code in an inner circle.

The point is not tidiness. It is that **policy must be able to outlive the things that deliver it**. If the business rules import the ORM, the ORM's lifetime becomes the business rules' lifetime.

## Crossing a boundary
The call goes one way; the dependency must go the other. That inversion is done with an interface:

- The **inner** circle declares the interface it needs (`OrderRepository`, `PaymentGateway`).
- The **outer** circle implements it (`PostgresOrderRepository`, `StripeGateway`).
- Something at the very edge — the `main` component, a container, a factory — wires the two together. It is the most volatile, most concrete thing in the system, and nothing depends on it.

## The data that crosses
Pass **simple, boundary-owned structures** across. Do not pass an ORM row, a framework request object, or an entity of the outer circle inward — that smuggles the outer circle's shape past the interface and quietly recreates the dependency you just inverted. It is the most common way a correct-looking layering leaks.

## The tell
- An import of a framework, a driver, or an HTTP type inside a use case or a domain type.
- A domain object annotated with persistence or serialization metadata.
- An inner interface whose method signatures are shaped by the outer implementation's needs.

## The caveat
The rule is about **source-code dependencies**, not about runtime call direction or network direction. Data flows both ways at runtime; that is fine and expected. Only the compile-time arrow is constrained.
