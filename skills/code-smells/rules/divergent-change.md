> Part of the `code-smells` skill (see `../SKILL.md`).

# Divergent Change

**Tell:** one class changes for many unrelated reasons — a DB change touches it, a pricing-rule change touches it, a report-format change touches it too.

It's the direct opposite of the Single Responsibility Principle: several independent axes of change drag the same class. The test: "whenever X changes I edit this class, and whenever unrelated Y changes I edit the same class."

**Fix:** Extract Class — split each responsibility into its own class so every class has exactly one reason to change. It's the symmetric partner of Shotgun Surgery: split here, gather there.
