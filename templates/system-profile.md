<!--
TEMPLATE: system-profile (the machine-facing half of /analyze)
Filled by the architectural-analyzer alongside the human-facing docs/analysis/architecture.md.
This file is FACTS, not narrative: what the repo IS, in a shape later stages can consume without
reading a thousand-line report. Every downstream stage reads this one and reaches for the prose
report only when a human is in the loop.
Keep the headings and table columns STABLE — stages anchor on them.
PRUNE optional sections that don't apply; (required) sections always stay.
-->

# System profile — <repo>

## Metadata (required)
- **Generated:** <YYYY-MM-DD>
- **Coverage:** full | partial
- **Not covered:** <paths sampled, skipped, or truncated — or `none`. Never leave a gap silent.>

## Stack (required)
> One row per ecosystem actually present, with the manifest that proves it.

| Ecosystem | Version | Manifest | Package manager |
|---|---|---|---|

## Components (required)
> The structural units discovered, by evidence. This is the raw material `/components` reconciles with
> the HLD — names here are the code's names, not the design's.

| Component | Path | Entrypoint | Ca | Ce |
|---|---|---|---|---|

## Dependency edges (required)
> The import graph between components, as facts. Consumed by `/components` (metrics), `/boundaries`
> (divergence), and `/decompose` (which epics are parallel-safe).

| From | To | Evidence |
|---|---|---|

## Dependency cycles (required)
> Every cycle found, as its full path — or `none`.

## Conventions observed (required)
> The repo's real conventions, each with a file that demonstrates it. This is what `/guidelines` mines
> instead of emitting language defaults.

| Area | Convention in use | Evidence |
|---|---|---|
| Naming | | |
| Error handling | | |
| Module layout | | |
| Async / concurrency | | |

## Test setup (required)
> What `/generate-test-guide` and `/plan` need and would otherwise rediscover: the runner, the layout,
> the factories and DSL that already exist, and the real commands.

- **Runner + config:**
- **Test layout:**
- **Existing factories / builders / DSL:**
- **Commands:** test · type-check · lint · build

## Integration points (required)
> Everything the system talks to across a process boundary.

| System | Kind (db \| cache \| queue \| http \| storage \| other) | Reached from | Config source |
|---|---|---|---|

## Inherited constraints (required)
> What cannot change without breaking something outside this repo: published contracts, persisted
> schemas, public events, hard runtime floors. `/interview` reads this so brownfield elicitation asks
> about the immovable, not only about the desired.
