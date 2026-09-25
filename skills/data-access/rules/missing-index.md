> Part of the `data-access` skill.

# Missing index

**The tells.** The diff adds a query that filters, joins or sorts on a column (or a combination of columns) that no index covers. It also flags a migration that adds a foreign key or a lookup column with no index. And an index whose column order does not match the query: an index on `(created_at, account_id)` does not serve `WHERE account_id = ? ORDER BY created_at`.

**Failure scenario.** A new "invoices for this customer, newest first" query filters on `customer_id` and sorts on `issued_at`. With no index, every call is a full table scan plus a sort. It takes 3 ms on the 1,000-row development table and 4 s on the 20-million-row production table, and the scans compete with every other query for I/O.

**The fix.**
- **Index what the query filters, joins and sorts on**, in the order that serves it: equality columns first, then the range or sort column.
- **Check the plan.** Run the database's `EXPLAIN` against realistic data, not against a fixture. An index the planner does not use is a write cost with no read benefit.
- **Create it safely.** On a large live table, use the online or concurrent form the database provides. The stack guide and the migration conventions name it.

**Watch for.** Indexes on low-cardinality columns that the planner will ignore. Every index slows writes, so do not add one "just in case". Functions applied to the column in the `WHERE` (`lower(email) = ?`) defeat a plain index on it.
