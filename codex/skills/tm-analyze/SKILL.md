---
name: tm-analyze
description: "Analyze an existing codebase (brownfield), the structural profile and architecture report, then optional per-component deep dives."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.6.7`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (optional) component name to deep-analyze; omit for the whole system


## One component named
If the text after the skill name names a component, call the `spawn_agent` tool with `agent_type = "tm-component-analyzer"` to deep-analyze it into `docs/analysis/components/<component>.md`.

## Whole system
Otherwise, run in two passes: the global map first, then depth, because coupling and seams live *between* parts and an analysis that starts inside one part cannot see them.

1. **Global.** Call the `spawn_agent` tool with `agent_type = "tm-architectural-analyzer"`. It writes `docs/analysis/system-profile.md` (the facts other stages consume: stack, components, import graph, conventions, test setup, inherited constraints) and `docs/analysis/architecture.md` (risks, SPOFs, debt, security; the analysis a human reads).
2. **Depth, optionally.** Show the discovered components and ask which deserve a deep dive. Then call the `spawn_agent` tool with `agent_type = "tm-component-analyzer"` once per chosen component, all **at once** (at most 6 running together; wait for every one), so they run in parallel; each is told which component it owns and pointed at the system profile for the global map. Don't ask the user to name components the analysis just discovered.

This partition is safe only because step 1 ran first: each agent gets its slice **plus** the map, and is accountable for the seams on its own side.

3. **Check the fan-out landed.** When they return, compare the components **chosen** with the files **on disk**: each must have `docs/analysis/components/<component>.md`, starting with its frontmatter. An agent that failed or truncated leaves nothing, and nothing says so. Re-dispatch the missing ones **once**, at once (at most 6 running together; wait for every one); whatever is still missing after that is listed, not retried again. Check the disk, not the agents' replies: a reply that says "done" is not a file.

## After it returns
Show a short summary, and, first, **what was not covered**: paths sampled, skipped or truncated; components chosen whose analysis is still missing after the re-dispatch; components discovered but not deep-analyzed, marked as such by choice; and every analysis whose frontmatter says `coverage: partial`. A partial analysis reads exactly like a complete one, so the gaps are the part worth surfacing.

**Offer the HTML report.** `architecture.md` is long, and its risks and debt are what a human decides from. On a yes, read the `visuals` skill (`references/skills/visuals/SKILL.md`) and render with `html-report.md`: the header carries the component map (a Mermaid `flowchart` from the import graph in the system profile, cycles in red); then one card per risk or debt item with a proposed change, with its strength, its files and a before/after of the structure it would change, and the top recommendation first. Items with no proposed change stay in the markdown and are named under Not covered.

Then note what now consumes this: `$thasmorato-skills:tm-interview` (inherited constraints), `$thasmorato-skills:tm-prd`, `$thasmorato-skills:tm-hld` (the AS-IS), `$thasmorato-skills:tm-components` (metrics and cycles), `$thasmorato-skills:tm-boundaries` (divergence), `$thasmorato-skills:tm-guidelines` and `$thasmorato-skills:tm-generate-test-guide` (real conventions), and `$thasmorato-skills:tm-adr-identify --brownfield`. Each of those reads the profile **if it exists** and falls back to discovering on its own if it doesn't; this stage accelerates them, it is never a prerequisite.
