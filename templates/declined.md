<!--
TEMPLATE: declined (proposals the owner turned down, so no stage proposes them again)
Read by /tidy, /trim and /review before they propose; appended to when the owner declines a proposal
for a reason that will still hold next time. APPEND-ONLY: never edit or delete an entry; when a reason
stops holding, add an entry that says so (`Status: reopened`, with the date and why).

WHAT GOES IN: a decline whose reason a future proposer would need in order not to propose the same
thing again. "We keep the two handlers separate: they will diverge when the B2B rules land (ticket 14)."
WHAT STAYS OUT: passing reasons ("not now", "out of scope for this ticket") and self-evident ones. Those
are answered in the moment and recorded nowhere. A reason that is an architectural decision (hard to
reverse, surprising without context, a real trade-off) is an ADR instead: offer `/adr-generate`.
-->

# Declined proposals

## D-<NNN>: <the proposal, as the stage stated it>
- **Proposed by:** <tidy | trim | review (lens)> · <the stage's output file>
- **Scope:** <the files, path or glob it applies to>
- **Kind:** <the rule, criterion or finding category: e.g. tidy rule 3 duplication, trim footprint, review quality Feature Envy>
- **Reason:** <the owner's reason, in their words where possible>
- **Revisit when:** <the event that would make the proposal right after all, or `never`>
- **Decided:** <owner>, <YYYY-MM-DD>
- **Status:** declined
