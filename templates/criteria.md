<!--
TEMPLATE: criteria (.scratch/<effort>/criteria/<feature>.md: one feature's acceptance criteria for one effort)
Filled by the fdd-writer alongside docs/features/<feature>/fdd.md. The FDD is living and carries no
acceptance criteria: a criterion is the yardstick of one delivery, so it lives with the effort, and
when its tickets are delivered `/tm-acceptance` absorbs it into the FDD as a rule
(${CLAUDE_PLUGIN_ROOT}/skills/acceptance/absorb.md). Temporary: it goes with .scratch/<effort>/.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` (or `> Needs Input:` when no
value is defensible), per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N). Each marker is a callout: the line above it is
`> [!CAUTION]` for Needs Input, `> [!WARNING]` for Assumed, `> [!NOTE]` for Decided, and every line
of the marker starts with `> `.
-->

# Acceptance criteria: <feature> (<effort>)

## Metadata (required)
- **Feature:** <the feature id and slug from docs/features/README.md, e.g. F3 (`checkout`)>
- **Effort:** <slug>
- **FDD:** [fdd.md](../../../docs/features/<feature>/fdd.md)
- **Status:** draft | in review | approved

## Criteria (required)
> Verifiable conditions under which this effort's change to the feature is correct: contracts ok,
> tests passing, performance or resilience where relevant. Not subjective judgment. Numbered, because
> `/tm-tickets` copies them down and every ticket AC names the criterion it comes from.
>
> **Precedence.** Criteria exist at three levels: the product's (`.scratch/<effort>/scope.md`), here,
> and the plan's SIs. This file is the **authority for this feature in this effort**: it refines the
> product criteria into verifiable ones, and the tickets and SIs decompose these. When two disagree,
> this file wins over the product criteria and over a plan; a genuine conflict with the product
> criteria is a finding, not something to smooth over.
>
> **`State`** starts `open`. `/tm-acceptance` moves it to `delivered (<ticket>), waiting on <tickets>`
> and then to `absorbed (<where>)`.

| Id | Criterion | Refines | State |
|---|---|---|---|
| **AC-1** | <condition> | [PAC-<n>](../scope.md) \| [RF-<n>](../../../docs/product/prd.md) | open |
