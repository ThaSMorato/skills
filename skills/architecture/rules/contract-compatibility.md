> Part of the `architecture` skill (see `../SKILL.md`).

# Contract compatibility — a published contract changes only compatibly

A **published contract** is anything another party already depends on, which you cannot change in the same deploy as them: an HTTP / gRPC / GraphQL API, a message or event schema, a public module interface used by another component or package, a CLI's flags and output, a file or database format someone else reads. The FDD's **Public contracts** section names the ones a feature owns; the rest are found where the code exposes them (`component-analysis`'s Exposed contracts).

**The tell — a change that breaks a consumer:**

| Change | Why it breaks |
|---|---|
| a field, parameter, endpoint, event or flag **removed or renamed** | the consumer still sends or reads it |
| a type **changed** (string → number, nullable → required, a wider enum returned) | the consumer's parser or switch fails |
| a **required** input added | every existing call is now invalid |
| an **error** shape, code or status changed | the consumer's error handling no longer matches |
| **observable behavior** changed with the same signature (ordering, defaults, pagination, rounding, timing) | consumers depend on what the contract does, not only on what it says (Hyrum's Law) |

**Compatible by default:** adding an optional field or parameter, adding an endpoint or event, returning a field the consumer can ignore, accepting more than before.

**The fix — expand, migrate, contract:**
1. **Expand**: add the new shape alongside the old; both work.
2. **Migrate**: move every consumer to the new shape. Where consumers are outside the repo, announce a deprecation with a date, and measure who still uses the old shape (logs, metrics, the consumers' contract tests; see `testing` → `contract.md`).
3. **Contract**: remove the old shape **only with evidence of zero remaining consumers**. The removal ticket carries that as an acceptance criterion: no call in the logs over the agreed window, no import in any consumer repo, no failing consumer contract test.

A version bump (`/v2`, a new event name) is the same sequence with a longer migrate step, not a way around it.

**Watch for:** a "harmless" rename in a response DTO; a default that changed because a library changed; an error that used to be a `404` and is now a `400`; a field made required in validation while the docs still say optional.
