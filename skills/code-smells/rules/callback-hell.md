> Part of the `code-smells` skill (see `../SKILL.md`).

# Callback Hell

**Tell:** logic stacked in callbacks — lifecycle hooks (ORM, events) or nested async callbacks — where the side effect is hidden, the order is hard to trace, and the flow indents rightward into a "pyramid of doom."

Saving a record silently triggers an email/job/another write that the caller never sees; or each async step nests inside the previous one.

**Fix:** Make the flow explicit. Move business logic out of lifecycle hooks into a use case / orchestrating service that calls the steps in the open. Flatten nested async into `async/await`, chained promises, or a pipeline.
