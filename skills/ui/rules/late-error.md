> Part of the `ui` skill (see `../SKILL.md`).

# Error found too late, or far from its cause

**The tell.** The screen only tells the user something is wrong after they submit, after a long operation, or the next day by email, when it could have said so earlier: a format checked only on the server, a multi-step action that fails at step three for a reason knowable at step one, a destructive action with no confirmation. Or the error arrives detached from its cause: a banner at the top of a long form, the input cleared, focus left on the submit button.

**Failure scenario.** A user fills a twelve-field form, submits, and gets "Invalid data" at the top; their entries are gone and nothing says which field. A transfer debits the source account and then fails because the destination does not exist. A user deletes a project they meant to archive, because both buttons looked the same and neither asked.

**The fix.** Shift the error left, cheapest first:
1. **Static validation** as the user types or leaves the field: length, format, check digits, nothing that needs a request.
2. **Early validation** before a multi-step operation starts: check everything checkable (the destination exists) before the first irreversible step.
3. **Let them try it**: a preview, a dry run, a test mode where they can see the result before committing.
4. **Ask for confirmation** on the probable mistake (*did you mean...?*, "this deletes 240 files"). A confirmation can be clicked through, so it is for the likely mistake; input that must be rejected is an error, not a warning.

Show the error next to the field it is about, keep what the user typed, and move focus to it (or to an error summary linking each field) so a keyboard or screen-reader user finds it (`rules/focus-management.md`). What the message itself says is `code-smells` → `unactionable-error`.
