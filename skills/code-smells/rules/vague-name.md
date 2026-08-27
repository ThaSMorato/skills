> Part of the `code-smells` skill (see `../SKILL.md`).

# Vague Name

**Tell:** a name too generic to say what it refers to — `data`, `obj`, `tmp`, `result`, `count`, `value`, `manager` — so the reader must go read the code to learn what it actually is.

A name should form a precise image in the reader's head. Names that describe the *type* rather than the *role* (`list`, `map` instead of `pendingOrders`) have the same problem.

**Fix:** Choose a precise, specific name that reveals intent — `pendingOrders`, `remainingBytes`, `nextRetryAt` (wider scope → more descriptive name). Distinguish from Hard to Pick Name: a vague name is laziness with a fine design; a name that's genuinely *hard to pick* points to a confused design.
