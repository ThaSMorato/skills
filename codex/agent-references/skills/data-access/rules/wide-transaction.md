> Part of the `data-access` skill.

# Wide transaction

**The tells.** A database transaction that stays open across something slow or unbounded: an HTTP call to another service, sending an email, publishing to a queue, a loop over a large set, or waiting on the user. Also a transaction opened implicitly by a framework around a whole request or job, with slow work inside it.

**Failure scenario.** A checkout opens a transaction, locks the order row, calls the payment provider (p99 of 2 s), then commits. Under load, every concurrent checkout for the same inventory waits on that lock, the connection pool drains, and unrelated requests start failing to get a connection. Worse, if the payment succeeds and the commit then fails, the customer is charged for an order that does not exist.

**The fix.**
- **Keep the transaction to the database work that must be atomic.** Do the remote call before, or after it commits.
- **Make a remote side effect reliable without holding a lock**: write an outbox row in the same transaction and publish it after commit, or make the remote call idempotent and reconcile.
- **Chunk large writes** into several short transactions when full atomicity is not actually required, and say so in the code.

**Watch for.** Nested transaction helpers that silently join an outer transaction and so widen it. Lock ordering that differs between two paths (the deadlock recipe). Reads at a weaker isolation level than the logic assumes.
