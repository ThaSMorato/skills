> Part of the `testing` skill (see `SKILL.md`).

# Contract testing

A contract test checks that a **consumer** and a **provider** agree on an API without running them together. It sits between the integration test (one side, the other faked) and the E2E test (both sides, everything real): each side is tested alone, against the same written agreement.

## How it works (consumer-driven)

1. The **consumer's** tests describe the requests it sends and the responses it needs. Running them produces a **contract** file: those interactions, as data.
2. The contract is shared with the provider (a broker, or a file in a shared place).
3. The **provider** runs a verification: it replays each request against itself and checks that its responses satisfy the contract.
4. Each side deploys on its own schedule, knowing the integration still holds. A provider change that breaks a consumer fails the provider's build, before it ships.

The consumer asks only for what it uses. A field the provider sends and no consumer reads can change freely; that is what makes the contract narrower, and cheaper to keep, than an API schema.

## When it pays off

| Situation | Approach |
|---|---|
| Consumer and provider owned by different teams, or deployed separately | contract tests; they replace the coordination an E2E run would need |
| The API changes often | contracts catch the breaking change in the provider's build |
| One provider, many consumers (services, mobile + web) | each consumer publishes its own contract; the provider verifies all of them |
| One team, one repository, deployed together | usually not worth it: an integration or E2E test covers the same seam for less |

## Rules

- **Contracts describe behavior the consumer depends on, not the provider's whole schema.** Match on types and required fields, not on every literal value, or the contract breaks on data that does not matter.
- **Provider states are explicit.** "Given user 42 exists" is set up by the provider's verification, not assumed to be in some shared database.
- **A failing verification is a breaking change**, not a flaky test. Either the provider keeps the old behavior (expand, then migrate consumers, then contract) or the consumer's contract changes first.
