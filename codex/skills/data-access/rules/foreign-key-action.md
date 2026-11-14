> Part of the `data-access` skill.

# Foreign key with no action

**The tells.** A migration adds a foreign key and says nothing about what happens to the child rows when the parent is deleted or its key changes: no `ON DELETE`, no `ON UPDATE`, so the database's default applies (`NO ACTION` or `RESTRICT` in most). Or the opposite: an `ON DELETE CASCADE` added by habit, on a relation where the children are records someone needs (payments, audit entries, a user's content). The ORM hides both: a `belongs_to` or `@ManyToOne` with no option writes the default into the schema.

**Failure scenario.** A course gets a `saved_lessons` table whose rows point at `lessons` with no action. Months later an author deletes a lesson; the delete fails with a constraint error for every lesson any student saved, and the admin screen shows a 500. Or, with the cascade: deleting a test customer in production also deletes their 2,000 invoices, which accounting needed.

**The fix.**
- **Choose the action per relation, on purpose**, and write it in the migration: `CASCADE` when the children have no meaning without the parent, `SET NULL` when they outlive it, `RESTRICT` when deleting the parent must be stopped and the application says why.
- **Make the application match the choice.** A `RESTRICT` needs the delete path to check first and show the user what blocks it; a soft delete may be the real answer for records that must stay.
- **Test the delete**: a test that deletes a parent with children and asserts what happens to them.

**Watch for.** A cascade chain that reaches further than the first table (lessons → saved_lessons → notes). A foreign key added to a table that already holds rows that break it. Two relations to the same parent with different actions, where the order of deletes then matters.
