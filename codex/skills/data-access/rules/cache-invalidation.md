> Part of the `data-access` skill.

# Cache invalidation

**The tells.** The diff adds or changes a write path (an update, a delete, a new way to mutate a record) for data that some cache holds, and nothing invalidates, updates or expires that cache entry. The inverse also counts: a new cache added over data whose writers were not all found. Or a cache key that omits something the value depends on (the user, the locale, a permission).

**Failure scenario.** Product prices are cached for an hour. A new admin endpoint updates prices directly, and the cache is not touched. For up to an hour, customers see and are charged the old price. Nothing errors, and the bug is reported as "prices sometimes don't update".

**The fix.**
- **Find every writer** of the cached data before adding a cache, and invalidate (or write through) on each of them. Centralizing writes behind one path makes this checkable.
- **Put every input the value depends on in the key.** A value that differs per user in a key without the user is a data leak, not only a staleness bug.
- **Give every entry a TTL** as a backstop, sized to how stale the data may be, and write that tolerance down.

**Watch for.** Invalidation that happens before the transaction commits, so a concurrent read repopulates the cache with the old value. Derived caches (counts, aggregates) that depend on data written elsewhere. A cache in front of a query that was fixed for N+1, masking the fix's absence rather than confirming it.
