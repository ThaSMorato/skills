> Part of the `code-smells` skill (see `../SKILL.md`).

# Hard to Pick Name

**Tell:** you can't find a simple, precise name for a variable or method — you spend minutes, settle for a mediocre one, or reach for an "and" name (`dataAndFlag`, `resultOrError`).

The problem is rarely vocabulary; it's a sign of confused design. No single name describes everything the thing does because it does more than one thing, or its meaning shifts across its scope.

**Fix:** Treat it as a diagnosis, not a cosmetic issue: something hard to name is usually hard to describe and violates single-responsibility. Redesign the entity to have one clear purpose — then the name appears on its own. (Distinct from Vague Name, where the design is fine and the name was just lazy.)
