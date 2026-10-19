---
description: Analyze an existing codebase (brownfield), the structural profile and architecture report, then optional per-component deep dives.
argument-hint: "(optional) component name to deep-analyze; omit for the whole system"
---

## One component named
If $ARGUMENTS names a component, Delegate to subagent `component-analyzer` to deep-analyze it into `docs/analysis/components/<component>.md`.

## Whole system
Otherwise, run in two passes: the global map first, then depth, because coupling and seams live *between* parts and an analysis that starts inside one part cannot see them.

1. **Global.** Delegate to subagent `architectural-analyzer`. It writes `docs/analysis/system-profile.md` (the facts other stages consume: stack, components, import graph, conventions, test setup, inherited constraints) and `docs/analysis/architecture.md` (risks, SPOFs, debt, security; the analysis a human reads).
2. **Depth, optionally.** Show the discovered components and ask which deserve a deep dive. Then Delegate to subagent `component-analyzer` once per chosen component, all **in a single message**, so they run in parallel; each is told which component it owns and pointed at the system profile for the global map. Don't ask the user to name components the analysis just discovered.

This partition is safe only because step 1 ran first: each agent gets its slice **plus** the map, and is accountable for the seams on its own side.

3. **Check the fan-out landed.** When they return, compare the components **chosen** with the files **on disk**: each must have `docs/analysis/components/<component>.md`, starting with its frontmatter. An agent that failed or truncated leaves nothing, and nothing says so. Re-dispatch the missing ones **once**, in a single message; whatever is still missing after that is listed, not retried again. Check the disk, not the agents' replies: a reply that says "done" is not a file.

## After it returns
Show a short summary, and, first, **what was not covered**: paths sampled, skipped or truncated; components chosen whose analysis is still missing after the re-dispatch; components discovered but not deep-analyzed, marked as such by choice; and every analysis whose frontmatter says `coverage: partial`. A partial analysis reads exactly like a complete one, so the gaps are the part worth surfacing.

**Offer the HTML report.** `architecture.md` is long, and its risks and debt are what a human decides from. On a yes, Load skill `thasmorato-skills:visuals` and render with `html-report.md`: the header carries the component map (a Mermaid `flowchart` from the import graph in the system profile, cycles in red); then one card per risk or debt item with a proposed change, with its strength, its files and a before/after of the structure it would change, and the top recommendation first. Items with no proposed change stay in the markdown and are named under Not covered.

Then note what now consumes this: `/tm-interview` (inherited constraints), `/tm-prd`, `/tm-hld` (the AS-IS), `/tm-components` (metrics and cycles), `/tm-boundaries` (divergence), `/tm-guidelines` and `/tm-generate-test-guide` (real conventions), and `/tm-adr-identify --brownfield`. Each of those reads the profile **if it exists** and falls back to discovering on its own if it doesn't; this stage accelerates them, it is never a prerequisite.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
