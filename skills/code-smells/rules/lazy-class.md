> Part of the `code-smells` skill (see `../SKILL.md`).

# Lazy Class

**Tell:** a class that doesn't do enough to justify its existence — left over from a refactoring that shrank it too far, or from speculative generality that never grew.

Every class charges an understanding tax (one more file, one more indirection). A lazy class doesn't pay its own.

**Fix:** Inline Class into the one that uses it, or Collapse Hierarchy if it's a near-empty subclass. Caution: a small class with a clear, single concept is not lazy — don't delete small classes by reflex.
