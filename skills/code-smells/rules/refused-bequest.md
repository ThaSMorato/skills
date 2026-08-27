> Part of the `code-smells` skill (see `../SKILL.md`).

# Refused Bequest

**Tell:** a subclass inherits methods or data it doesn't want — it uses only part of the inheritance, or overrides a method to throw or do nothing.

The inheritance is in the wrong place: "is-a" has degraded into "I reused the class." When the subclass isn't substitutable for its parent, it breaks the Liskov Substitution Principle.

**Fix:** If it merely inherits too much, Push Down Field/Method to the level that actually needs it. If the behavior doesn't fit at all, Replace Inheritance with Delegation — the class *has* a collaborator instead of *being* one.
