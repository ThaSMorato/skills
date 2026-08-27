> Part of the `code-smells` skill (see `../SKILL.md`).

# Alternative Classes with Different Interfaces

**Tell:** two classes do the same job but expose different APIs — divergent names or signatures for the same role — so you can't swap one for the other.

The conceptual duplication hides behind a superficial interface difference, and you lose the ability to substitute one implementation for the other.

**Fix:** Rename Method and Move Method to align the signatures until the classes are interchangeable, then Extract Superclass or a shared interface. Once interchangeable, the two can often be merged or handled polymorphically.
