> Part of the `security` skill. CWE-367 / CWE-362 · OWASP A04.

# Race conditions and time-of-check/time-of-use

**The tell.** A check and the action it authorizes are separated by a gap that is not atomic: read a balance then write it; verify a coupon is unused then mark it used; check a file's properties then open it; confirm a quota then consume it.

**Failure scenario.** Two concurrent redemptions of the same one-time voucher both read `used = false`, both pass the check, and both apply the discount. Repeated deliberately, this is how a single referral bonus becomes a thousand. The same shape drains a wallet below zero.

**The fix.** Make the check and the effect one atomic operation:
- A **conditional update** that carries the predicate — `UPDATE ... WHERE id = ? AND used = false`, then act on the affected-row count.
- A **unique constraint** that makes the second attempt fail at the database.
- A **lock** — a row lock inside a transaction, or a distributed lock keyed to the resource — held across the whole check-and-act.
- An **idempotency key** for operations a client may legitimately retry.

**Watch for.** Application-level "check then save" inside an ORM, a transaction whose isolation level does not actually prevent the interleaving, and retries that repeat a non-idempotent effect.

**Not a finding when.** The write itself carries the condition, or a constraint makes the duplicate impossible.
