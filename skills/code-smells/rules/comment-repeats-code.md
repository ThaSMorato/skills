> Part of the `code-smells` skill (see `../SKILL.md`).

# Comment Repeats Code

**Tell:** a comment restates what the code already says, using the same words as the method/variable name — `i++ // increment i`, `// constructor` above a constructor, `// returns the name` on `getName()`.

If you can deduce the comment by reading the line beside it, it's noise. A good comment lives at a *different level of abstraction* from the code.

**Fix:** Comment at a higher level (intent, the *why*, an invariant) or a lower one (a precision the code doesn't show: units, contract, edge case) — never restate the *what*. If there's nothing to add, delete it.
