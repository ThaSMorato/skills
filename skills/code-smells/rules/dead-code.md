> Part of the `code-smells` skill (see `../SKILL.md`).

# Dead Code

**Tell:** code that never runs — an unused variable, parameter, method, or class; an unreachable branch; or commented-out code kept "just in case."

It does no harm at runtime but charges a reading tax: everyone who passes through has to understand something that doesn't matter.

**Fix:** Delete it. Version control remembers, so there's no need to keep commented-out code around. Remove unused parameters, methods, and classes so what remains speaks for itself.
