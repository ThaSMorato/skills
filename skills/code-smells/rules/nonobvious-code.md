> Part of the `code-smells` skill (see `../SKILL.md`).

# Nonobvious Code

**Tell:** you read a line and think "wait, what does this do?" — you have to stop, reread, and simulate it in your head to reconstruct the intent.

Ousterhout uses obviousness as the central readability metric: if something isn't obvious, it's a red flag. Hidden side effects, order dependence, a return value with disguised meaning, magic numbers, and vague names all push the cost of understanding onto everyone who comes after.

**Fix:** Make it obvious first — precise names, types that reveal intent, break up dense expressions, remove unnecessary cleverness. Only when the code genuinely can't be made obvious, add a comment supplying the missing *why* — not one that repeats the code.
