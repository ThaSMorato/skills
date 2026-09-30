<!--
TEMPLATE: component-analysis (one component, deep)
Filled by the component-analyzer, one file per component, under docs/analysis/components/.
Two stages read it: /fdd for the real contracts and conventions of the area a feature touches, and
/design (with pattern-scout) for the primitives to reuse. Write for them: concrete names, real
signatures, path:line. Not a summary.
Keep the headings, table columns and frontmatter STABLE — stages anchor on them, and the counts are
read by /analyze's coverage check.
PRUNE optional sections that don't apply; (required) sections always stay.
The written file STARTS with the frontmatter below; this comment is not copied.
-->

---
kind: component-analysis
component: <name, as in docs/analysis/system-profile.md>
analyzed_at: <YYYY-MM-DD>
analyzed_commit: <git rev-parse HEAD>
coverage: full | partial
rules: {explicit: <n>, tested: <n>, inferred: <n>}
contracts: <n exposed contracts listed below>
---

# Component — <name>

## Not covered (required)
> Paths sampled, skipped or truncated, and why — or `none`. A partial analysis reads exactly like a
> complete one; this is where it says it is not.

## Structure (required)
> The internal layout: modules, their responsibilities, and the entry points. Reference the system
> profile for the global map; don't restate it.

## Business rules (required)
> Every rule, validation, invariant and domain constraint the component enforces, with where it lives
> and **how sure you are it is a rule**:
> - `explicit` — stated in code as a rule (a validation, a guard, a policy object);
> - `tested` — a test asserts it (cite the test), so a change to it will be caught;
> - `inferred` — deduced from how the code behaves, with nothing stating or testing it.
> An `inferred` rule is exactly what a FDD must confirm with the owner before relying on it.

| Rule | Confidence | Where | Test |
|---|---|---|---|

## Exposed contracts (required)
> Everything outside the component can call or consume: HTTP / gRPC / GraphQL endpoints, published
> events, public module interfaces, CLI commands, jobs. Signature, inputs, outputs, error modes.
> `none` if it exposes nothing (say so; don't omit the section).

| Contract | Kind | Signature / shape | Where |
|---|---|---|---|

## Tests that exercise it (required)
> Every test that reaches this component, **including those that live in other folders** (an E2E
> suite, a contract test, a neighbour's integration test). For each: the seam it attaches at, and
> whether collaborators are real or faked — a faked collaborator means the contract between them is
> assumed, not tested; name that contract.

| Test | Seam | Collaborators | Assumed contract |
|---|---|---|---|

## Dependencies and seams (required)
> What it reaches for (internal components, external libraries, infrastructure) and what it assumes
> about each neighbour, with the assumptions nobody documented called out.

## Patterns and conventions (optional)
> How this component does errors, validation, data access, logging and tests — the rows pattern-scout
> and review-standards reuse.

## Debt and risks (optional)
> Smells, coupling, missing tests, error handling that swallows — each at path:line.
