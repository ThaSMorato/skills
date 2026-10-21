> Part of the `data-access` skill.

# Query in a loop

**The tells.** An explicit data call inside a loop body over a collection that can grow: `repository.find(id)`, `db.query(...)`, `save(entity)`, an `exists?` check. This is N+1's explicit sibling. No ORM magic is involved, and so it is easier to see and more often waved through ("it's only a lookup"). Writes count too: one `INSERT` or `UPDATE` per element.

**Failure scenario.** An import job validates each of 10,000 rows with `products.find_by_sku(sku)`. That is 10,000 round trips, each around 1 ms of network latency, so 10 seconds of pure waiting before any work is done. The same shape on a request path turns a bulk action on 500 items into a timeout.

**The fix.**
- **Collect, then query once**: gather the keys in the loop, fetch them all in one call (`WHERE sku IN (...)`), and index the result in memory by key.
- **Batch writes**: a bulk insert or update, or one statement per chunk, rather than one per element.
- **Chunk very large sets** so the single query does not become an unbounded one. See `unbounded-result.md`.

**Watch for.** The loop and the query in different files: a service loops, and a helper it calls does the lookup. That is exactly the case the review's one-hop rule exists for. Also recursive tree walks that query per node, and validations that check uniqueness one row at a time.
