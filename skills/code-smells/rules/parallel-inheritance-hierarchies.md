> Part of the `code-smells` skill (see `../SKILL.md`).

# Parallel Inheritance Hierarchies

**Tell:** every time you add a subclass in one hierarchy you're forced to add a matching subclass in another — the prefixes mirror each other (`FooDialog`/`FooController`, `BarDialog`/`BarController`).

A special case of Shotgun Surgery: the two hierarchies are locked in step, so growth in one always duplicates growth in the other.

**Fix:** Make one hierarchy refer to the other, then Move Method / Move Field until the duplication dissolves — ideally collapsing the two into one, or having an instance of one point to an instance of the other instead of mirroring by inheritance.
