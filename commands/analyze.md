---
description: Analyze an existing codebase (brownfield) — the structural profile and architecture report, then optional per-component deep dives.
argument-hint: "(optional) component name to deep-analyze; omit for the whole system"
---

## One component named
If $ARGUMENTS names a component, use the `component-analyzer` agent to deep-analyze it into `docs/analysis/components/<component>.md`.

## Whole system
Otherwise, run in two passes — the global map first, then depth, because coupling and seams live *between* parts and an analysis that starts inside one part cannot see them.

1. **Global.** Use the `architectural-analyzer` agent. It writes `docs/analysis/system-profile.md` (the facts other stages consume — stack, components, import graph, conventions, test setup, inherited constraints) and `docs/analysis/architecture.md` (risks, SPOFs, debt, security — the analysis a human reads).
2. **Depth, optionally.** Show the discovered components and ask which deserve a deep dive. Then dispatch one `component-analyzer` per chosen component **in a single message** so they run in parallel — each is told which component it owns and pointed at the system profile for the global map. Don't ask the user to name components the analysis just discovered.

This partition is safe only because step 1 ran first: each agent gets its slice **plus** the map, and is accountable for the seams on its own side.

3. **Check the fan-out landed.** When they return, compare the components **chosen** with the files **on disk**: each must have `docs/analysis/components/<component>.md`, starting with its frontmatter. An agent that failed or truncated leaves nothing, and nothing says so. Re-dispatch the missing ones **once**, in a single message; whatever is still missing after that is listed, not retried again. Check the disk, not the agents' replies: a reply that says "done" is not a file.

## After it returns
Show a short summary, and — first — **what was not covered**: paths sampled, skipped or truncated; components chosen whose analysis is still missing after the re-dispatch; components discovered but not deep-analyzed, marked as such by choice; and every analysis whose frontmatter says `coverage: partial`. A partial analysis reads exactly like a complete one, so the gaps are the part worth surfacing.

Then note what now consumes this: `/interview` (inherited constraints), `/prd`, `/hld` (the AS-IS), `/components` (metrics and cycles), `/boundaries` (divergence), `/guidelines` and `/generate-test-guide` (real conventions), and `/adr-identify --brownfield`. Each of those reads the profile **if it exists** and falls back to discovering on its own if it doesn't — this stage accelerates them, it is never a prerequisite.
