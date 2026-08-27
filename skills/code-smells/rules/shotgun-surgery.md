> Part of the `code-smells` skill (see `../SKILL.md`).

# Shotgun Surgery

**Tell:** a single change forces edits across many classes — "to add one field or one new type I touch eight files."

The inverse of Divergent Change: one responsibility is scattered everywhere. It's easy to miss a spot and introduce a bug, and expensive to evolve. The classic case is the same switch statement repeated in N places.

**Fix:** Gather what changes together — Move Method / Move Field (sometimes Inline Class) to concentrate the responsibility in one place. Rule of thumb: Divergent Change → split; Shotgun Surgery → gather.
