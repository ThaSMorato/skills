> Part of the `code-smells` skill (see `../SKILL.md`).

# Anemic Domain Model

**Tell:** entities are only data (getters/setters) and all business logic lives in "services." It looks object-oriented but is procedural in disguise.

Fowler calls it an anti-pattern precisely because it throws away the encapsulation that was the point of having objects. The rule sits far from the data it governs, which spreads Feature Envy, makes invariants hard to guarantee, and bloats services that mix orchestration with implementation.

**Fix:** Pull business rules into the entity/aggregate (a rich domain model): the entity protects its invariants and exposes behavior, while services are left to *orchestrate* only.
