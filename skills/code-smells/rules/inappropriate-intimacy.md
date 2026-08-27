> Part of the `code-smells` skill (see `../SKILL.md`).

# Inappropriate Intimacy

**Tell:** two classes reach into each other's internals — accessing private fields, depending on mutual implementation, always travelling in pairs.

Strong coupling: changing one breaks the other. It's Feature Envy in its mutual form — the two classes envy each other.

**Fix:** Move Method/Field to put each thing with its rightful owner; Extract Class for the shared part; Hide Delegate to cut chained access; and if the intimacy comes from bidirectional inheritance, replace it with delegation. Goal: shrink the surface each class knows of the other.
