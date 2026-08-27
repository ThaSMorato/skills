> Part of the `code-smells` skill (see `../SKILL.md`).

# Conjoined Methods

**Tell:** two methods so interdependent that you can't understand or change one without reading the other — you bounce back and forth to follow the logic.

They're physically separate but cognitively glued: state and logic entwine between them, and changing one breaks the other in non-obvious ways. The physical split brought no real separation — the worst of both worlds. It often comes from bad decomposition (e.g. slicing by time).

**Fix:** If they're really one concept, merge them into one method/class. If they should stay separate, make the dependency explicit and narrow via a clear interface, not implicit shared state — sometimes the shared state should become its own object both use plainly.
