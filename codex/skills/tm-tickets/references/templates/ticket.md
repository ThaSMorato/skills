<!--
TEMPLATE: ticket
Filled by $thasmorato-skills:tm-tickets, one file per ticket, from an FDD and the feature's criteria for the effort
(.scratch/<effort>/criteria/<feature>.md). A ticket is a tracer-bullet vertical slice:
one test seam crossed end to end. DUAL AUDIENCE: an agent may execute it, or the owner may pick it
up and build it by hand, so it must carry the WHY and the CONSTRAINTS, not just the WHAT.
PRUNE + RENUMBER optional sections that don't apply; (required) sections always stay.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` (or `> Needs Input:` when no
value is defensible), per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N). Each marker is a callout: the line above it is
`> [!CAUTION]` for Needs Input, `> [!WARNING]` for Assumed, `> [!NOTE]` for Decided, and every line
of the marker starts with `> `.
FRONTMATTER: `type`, `gear` and `acs` are fields, not prose, because $thasmorato-skills:tm-retro sums them; `acs` is the
number of AC-N lines under Acceptance criteria. A ticket that predates the frontmatter carries Type
and Gear as Metadata lines; read them there.
-->

---
kind: ticket
type: behavioral | structural | bugfix
gear: full | feature | small (the gear `$thasmorato-skills:tm-flow` confirmed for this work; `full` when nobody chose one)
acs: <the number of AC-N lines below>
---

# <NN>: <Ticket title>

## Metadata (required)
- **Status:** ready | blocked | in progress | done
- **Tracker:** <the issue's id or URL in the tracker, or `none (local only)`>
- **Source:** <[FDD](../../../docs/features/<feature>/fdd.md) + [criteria](../../<effort>/criteria/<feature>.md): the FDD and the criteria this slice comes from, as relative links; or `direct (<gear> gear, no FDD): <why>` when the flow deliberately skipped one; for a bugfix, the diagnosis: `.scratch/.../diagnoses/<slug>.md`>
- **Components touched:** <names from docs/architecture/components.md, or `unknown, no component map`>

> **Type** is verifiable, not decorative. A **structural** ticket (prefactoring, expand/migrate/contract)
> changes shape and **not behavior**: existing tests stay unchanged and stay green. A **behavioral**
> ticket changes what the system does, so it changes or adds tests. A **bugfix** ticket makes the system do what
> it was already supposed to do: its Source is a `$thasmorato-skills:tm-diagnose` file with the cause, and its tests are the pinned
> and flipped pairs at every level the diagnosis names.
>
> **Gear** is how every later stage learns how much process this work deserves: `$thasmorato-skills:tm-plan` copies it into
> the plan's frontmatter, and a gate that only belongs in the larger gears reads it there. An absent
> gear means `full`: a stage that cannot tell errs toward checking more, not less.

## What to build (required)
> The end-to-end behavior this ticket makes work, from the user's perspective, not a layer-by-layer list.

## Why (required)
> The value this slice delivers and the FDD goal it serves. A human picking this up needs the intent,
> not only the instruction.

## Test seam (required)
> The interface this slice is tested through, taken from the FDD's `Test seams` section. One seam per
> ticket when possible: this is what TDD targets and what sizes the ticket.

## Blocked by (required)
> The tickets that gate this one, by number, or `none (can start immediately)`.

## Acceptance criteria (required)
> Numbered and verifiable. The IDs are load-bearing: `$thasmorato-skills:tm-plan` maps each to an SI and `$thasmorato-skills:tm-plan-validate`
> checks the coverage mechanically. Each names the feature criterion it comes from, `(from <F-id> AC-n)`:
> that trace is how `$thasmorato-skills:tm-acceptance` knows when a criterion is delivered and can be absorbed into the FDD.
- [ ] **AC-1** (from [F<n> AC-<n>](../../<effort>/criteria/<feature>.md)):
- [ ] **AC-2** (from [F<n> AC-<n>](../../<effort>/criteria/<feature>.md)):

## Exclusions (required)
> What this ticket explicitly does NOT build, drawn from the FDD's scope exclusions and from the
> neighbouring tickets. This is the scope-creep guard at implementation time.

## Constraining ADRs (optional)
> The ADRs that bind the area this ticket touches (`docs/adr/NNNN-*.md`), with one line on what each
> constrains. Whoever implements (agent or human) must not relitigate these.

## Notes (optional)
> Anything that helps whoever picks this up. Avoid file paths and code snippets: they go stale.
> Exception: a decision-encoding snippet from a prototype, trimmed to the decision.
