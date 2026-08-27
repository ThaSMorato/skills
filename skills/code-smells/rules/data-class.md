> Part of the `code-smells` skill (see `../SKILL.md`).

# Data Class

**Tell:** a class that is only fields plus getters/setters, with no behavior — a bag of data that other classes manipulate.

It attracts Feature Envy: the logic that should be its own lives scattered across its callers. The distinction that matters: an honest DTO at a boundary (pure data transport, not pretending to be an object) is legitimate. The smell is an anemic *domain* class that should encapsulate rules and doesn't.

**Fix:** Move Method to pull the behavior back in, and make fields private behind a meaningful interface. If it truly is just transport, leave it as a DTO.
