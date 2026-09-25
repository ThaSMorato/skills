> Part of the `data-access` skill.

# Over- and under-fetching

**The tells.**
- **Over-fetching:** hydrating full rows or object graphs to use one or two fields. Eager-loading associations the code path never reads. `SELECT *` on a table with large text or blob columns, to render a list of names. Loading records to count them.
- **Under-fetching:** loading lazily what the path always needs, so every use pays a query. That is where N+1 comes from (see `n-plus-one.md`).

**Failure scenario.** A typeahead endpoint loads full `Product` records, including a 200 KB description and three eager-loaded associations, to return 10 names. Each keystroke moves several megabytes from the database and allocates thousands of objects, and p99 latency climbs under ordinary typing speed.

**The fix.**
- **Select the columns you use** (a projection or `pluck`) when you do not need the domain object.
- **Eager-load what the path always uses, and nothing else.** The decision is per path, not per model.
- **Let the database aggregate**: `COUNT`, `SUM` and `EXISTS` instead of loading rows to compute them.

**Watch for.** A projection that bypasses domain invariants the full object would have enforced, if the result is then written back. A shared "load everything" query reused by paths with very different needs.
