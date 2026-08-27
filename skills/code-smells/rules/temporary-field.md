> Part of the `code-smells` skill (see `../SKILL.md`).

# Temporary Field

**Tell:** an instance field holds a value only some of the time — usually set by one algorithm to avoid passing parameters, and null or irrelevant the rest of the time.

It confuses the reader ("why is this field sometimes null?") and creates invalid states the object can represent but shouldn't.

**Fix:** Extract Class (or Introduce Parameter Object / Replace Method with Method Object) so the field and the methods that use it live together — the state exists only while the calculation runs, instead of polluting the object permanently.
