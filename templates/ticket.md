<!--
TEMPLATE: ticket
Filled by /tickets, one file per ticket, from an FDD. A ticket is a tracer-bullet vertical slice —
one test seam crossed end to end. DUAL AUDIENCE: an agent may execute it, or the owner may pick it
up and build it by hand, so it must carry the WHY and the CONSTRAINTS, not just the WHAT.
PRUNE + RENUMBER optional sections that don't apply; (required) sections always stay.
-->

# <NN> — <Ticket title>

## Metadata (required)
- **Status:** ready | blocked | in progress | done
- **Type:** behavioral | structural
- **Source:** <docs/fdd/<feature>.md — the FDD this slice comes from>
- **Components touched:** <names from docs/components.md, or `unknown — no component map`>

> **Type** is verifiable, not decorative. A **structural** ticket (prefactoring, expand/migrate/contract)
> changes shape and **not behavior**: existing tests stay unchanged and stay green. A **behavioral**
> ticket changes what the system does, so it changes or adds tests.

## What to build (required)
> The end-to-end behavior this ticket makes work, from the user's perspective — not a layer-by-layer list.

## Why (required)
> The value this slice delivers and the FDD goal it serves. A human picking this up needs the intent,
> not only the instruction.

## Test seam (required)
> The interface this slice is tested through, taken from the FDD's `Test seams` section. One seam per
> ticket when possible — this is what TDD targets and what sizes the ticket.

## Blocked by (required)
> The tickets that gate this one, by number, or `none — can start immediately`.

## Acceptance criteria (required)
> Numbered and verifiable. The IDs are load-bearing: `/plan` maps each to an SI and `/plan-validate`
> checks the coverage mechanically.
- [ ] **AC-1** —
- [ ] **AC-2** —

## Exclusions (required)
> What this ticket explicitly does NOT build, drawn from the FDD's scope exclusions and from the
> neighbouring tickets. This is the scope-creep guard at implementation time.

## Constraining ADRs (optional)
> The ADRs that bind the area this ticket touches (`docs/adr/NNNN-*.md`), with one line on what each
> constrains. Whoever implements — agent or human — must not relitigate these.

## Notes (optional)
> Anything that helps whoever picks this up. Avoid file paths and code snippets — they go stale.
> Exception: a decision-encoding snippet from a prototype, trimmed to the decision.
