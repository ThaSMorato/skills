> Part of the `code-smells` skill (see `../SKILL.md`).

# Magic Numbers

**Tell:** an unnamed literal sits in the middle of the code — `total * 1.0825`, `if status == 3`, `sleep(86400)`.

The reader can't tell what the value means or why it was chosen, and changing it means hunting every occurrence while hoping not to confuse two unrelated `3`s. Magic strings are the same problem.

**Fix:** Extract a named constant that reveals intent (`ICMS_RATE`, `SECONDS_PER_DAY`). Better, give it a concept: a type/state code becomes an enum or Value Object; a business rule becomes a named policy.
