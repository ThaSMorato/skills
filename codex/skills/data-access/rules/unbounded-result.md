> Part of the `data-access` skill.

# Unbounded result

**The tells.** A read with no limit over a table that grows: `all()`, `SELECT * FROM events WHERE account_id = ?`, an endpoint that returns a whole collection, an export that loads every row into memory before writing it. The size is fine on the day it ships and becomes the incident a year later.

**Failure scenario.** An account's activity feed loads every event for the account. New accounts have 30. A two-year-old account has 400,000, so the endpoint allocates hundreds of megabytes, the worker is OOM-killed, and the retry kills the next one.

**The fix.**
- **Paginate** anything user-facing. Prefer keyset (cursor) pagination over `OFFSET` for large or deep sets, since `OFFSET` scans and discards every skipped row.
- **Stream or iterate in batches** for jobs and exports, so memory stays flat whatever the total.
- **Put a hard cap** on internal reads that "should" be small, and make exceeding it an error rather than a surprise.

**Watch for.** Unbounded reads hidden behind aggregation in application code (loading rows to count or sum them, where the database could). Associations loaded in full to show the first three. Admin tools, which are usually exempted from limits and usually run against the biggest accounts.
