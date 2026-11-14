> Part of the `data-access` skill.

# Compensation inside one database

**The tells.** Steps that write to the same database in the same process, each in its own transaction, with a compensating delete when a later one fails: create the user, then the channel, and delete the user if the channel fails. It usually appears after each service was given its own transaction, and sharing one "got complicated".

**Failure scenario.** The process dies between the channel failing and the compensation running, and the user is left without a channel, unable to sign up again with the same email. Or the compensation itself fails. Or, in the gap, a reader sees the user with no channel, and the confirmation email has already gone out.

**The fix.**
- **One transaction for the use case.** The application service opens it, and each module takes part through its own repository; all or nothing comes for free.
- **A retry of one step inside it** goes in a savepoint, not in a separate transaction.
- **A compensation that is really needed** (the steps span services or databases) is a saga: explicit process state, an idempotent and resumable compensation, and a plan for when the compensation fails.

**Watch for.** A compensation justified by a local design choice rather than a real constraint: that is the sign it should be a transaction.
