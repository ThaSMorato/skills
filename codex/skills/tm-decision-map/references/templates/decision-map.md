<!--
TEMPLATE: decision-map (.scratch/<effort>/decision-map.md: the decisions an effort needs before its PRD)
Written and kept by $thasmorato-skills:tm-decision-map, one decision per session; read by $thasmorato-skills:tm-flow for the frontier.
An INDEX, not a store: every decision lives in the document it binds (the brief, the PRD, an ADR, a
research report) and the map points at it. Only a decision about the effort's own path (its order,
what waits for what) lives here, as `here`. Temporary: it closes when nothing is open and the fog is
empty, and goes with the rest of .scratch/<effort>/ when the effort ships. It never becomes the plan:
cutting the work into epics and waves is $thasmorato-skills:tm-decompose's.
Ids: `D-<n>` for a decision, never reused; a revised decision keeps its id.
-->

---
kind: decision-map
plugin_version: 0.7.0
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
instructions: [<every value the project instructions already in your context ask this field to list, exactly as written; [] when none does; never open a file to find one>]
effort: <slug, the folder name under .scratch/>
status: open | closed
decided: <count of Decided lines>
open: <count of Open decisions rows>
fog: <count of Fog items>
---

# Decision map: <effort>

## Destination
> Where this effort ends, in one or two sentences, agreed with the owner before any decision. Bounded:
> an epic, a release, a migration; never "the whole product".

## Decided
> One line per decision, newest last: `- **D-<n>** (<YYYY-MM-DD>): <the decision>. Lives in: <path#anchor | here>`.
> A revision keeps the id and the line: `(revised <YYYY-MM-DD>; was: <the earlier decision>)`.

## Open decisions
> A precise question each. The type names the stage that resolves it; `Blocked by` lists the ids it
> waits for, or `nothing`.

| Id | Decision | Type | Blocks | Blocked by |
|---|---|---|---|---|

## Open elsewhere
> What is still open in the documents it binds, from `decision-map.mjs elsewhere`: `- <path>:<line>: <text>`.
> Listed, never copied: it is answered where it lives.

## Fog
> What will need deciding but cannot be asked precisely yet. Reviewed every session.
> Last reviewed: <YYYY-MM-DD>

## Out of scope
> What this effort will not decide, and where it goes instead (a later effort, `docs/evolutions.md`).

## Next step
> The one command for the owner to run, with its arguments.
