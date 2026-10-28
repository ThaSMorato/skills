<!--
TEMPLATE: scope (.scratch/<effort>/scope.md: what one effort changes in the product)
Filled by the prd-writer alongside docs/product/prd.md. The PRD is living: it states every requirement
of the system as it is, with no milestone and no acceptance criteria. What belongs to this effort
alone is here: the requirements it adds, changes or removes, the milestone it delivers first, and the
product-level acceptance criteria. Temporary: it goes with the rest of .scratch/<effort>/ when the
effort ships, after acceptance absorbs its criteria
(${CLAUDE_PLUGIN_ROOT}/skills/acceptance/absorb.md).
PRUNE + RENUMBER optional sections that don't apply; (required) sections always stay.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` (or `> Needs Input:` when no
value is defensible), per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N). Each marker is a callout: the line above it is
`> [!CAUTION]` for Needs Input, `> [!WARNING]` for Assumed, `> [!NOTE]` for Decided, and every line
of the marker starts with `> `.
-->

# Scope: <effort>

## Metadata (required)
- **Effort:** <slug, the folder name under .scratch/>
- **Status:** draft | in review | approved
- **Sources:** <.scratch/<effort>/brief.md, docs/product/prd.md>

## Requirements in this effort (required)
> Every PRD requirement this effort touches, by its id in `docs/product/prd.md`, and what the effort
> does to it. A requirement the PRD already had and this effort does not touch is not listed. A
> removed requirement is in the PRD's `Retired` section; it is listed here so the decomposition knows
> which feature loses scope.

| Requirement | Change | Milestone | From |
|---|---|---|---|
| RF-001 | adds \| changes \| removes | M1 | <brief section> |

## First milestone (required)
> The first release of this effort is **one guiding scenario completed end to end** (a walking
> skeleton: thin, but the persona reaches their goal), or the smallest set of scenarios worth having.
> Name it, and list the requirements marked `M1` above that complete it. A milestone that delivers
> pieces of three scenarios and finishes none ships nothing a user can do.
- **Completes:** GS-<n>
- **Requirements:** RF-<…>

## Product acceptance criteria (required)
> What makes this effort done at the product level, in verifiable conditions (not subjective
> judgment). Numbered, because the feature criteria refine them and the coverage checks follow the
> ids. Each names the requirements it checks.
- [ ] **PAC-1** (RF-001): <condition>

## JSON contract (required)
> The same content as a structured object (English keys, empty fields omitted): each requirement's
> `change` and `milestone`, the milestone's `completes` and requirement ids, each criterion's
> requirement ids. `/tm-doc-validate` compares the prose against it.
```json
{}
```
