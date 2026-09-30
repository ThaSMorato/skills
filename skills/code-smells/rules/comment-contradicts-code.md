> Part of the `code-smells` skill (see `../SKILL.md`).

# Comment Contradicts Code

**Tell:** a comment or doc string says something the code next to it does not do. `// returns null if not found` above a function that throws; `@param timeout in seconds` read as milliseconds; `// TODO: remove after migration` on code the migration still needs; a docstring listing a parameter the signature dropped.

**Why it hurts:** it is worse than no comment. A reader trusts the comment, since reading it is the point of it, and builds on the wrong behavior. It is the usual residue of a change that edited the code and not the words beside it.

**Fix:** decide which one is right. If the code is right, fix or delete the comment. If the comment describes the intended behavior, the code has a bug: report it as one. In a diff, check the comments around every changed line: the change is exactly when they go stale. Related: `comment-repeats-code.md` (a comment that restates the code goes stale first).
