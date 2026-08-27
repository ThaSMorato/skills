> Part of the `code-smells` skill (see `../SKILL.md`).

# Pass-Through Methods

**Tell:** a method does little but forward its arguments to another method — often with the same signature.

It grows interface complexity without adding functionality, makes the class shallower, and couples the two classes (change the target's signature and the forwarder must follow). It also confuses the reader: which of the two actually does the work?

**Fix:** Let the caller talk directly to the target, removing the intermediary. If the intermediary *should* add value, make it add value (real routing, transformation, policy). If many methods forward, the two classes may need to be merged or their responsibilities redivided. Real routing (adapting, hiding a delegate) is not the smell.
