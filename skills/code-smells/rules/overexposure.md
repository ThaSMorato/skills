> Part of the `code-smells` skill (see `../SKILL.md`).

# Overexposure

**Tell:** the API for a common case forces you to learn about rare features (or internal details) just to do the simple thing — the simple case isn't simple.

To handle the common path you must pass or understand parameters for rare cases, advanced config, or flags that 90% of callers ignore. A symptom of a shallow module: the interface is large relative to the functionality delivered.

**Fix:** Make the common case simple with sensible defaults, and segregate the rare features behind a separate, optional interface — make the module deeper so the common-case user needs to know as little as possible.
