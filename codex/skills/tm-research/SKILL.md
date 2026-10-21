---
name: tm-research
description: "Investigate a technical question against primary sources, producing a cited report that feeds the HLD/FDD."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.6.7`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <the research question>


Investigate: the text after the skill name

## Narrow question: one agent
Call the `spawn_agent` tool with `agent_type = "tm-researcher"`; run it in the background so you can keep working while it reads. It surveys, deep-reads, and writes `docs/research/<slug>.md`.

## Broad question: fan out the deep-read
When the question spans several sources that must each be read carefully (comparing three libraries, reading four specs), reading them all in one context runs out of room and the last source gets skimmed. Split it:

1. **Survey**: identify the sources that own the answer, with a short `WebSearch` pass in this context.
2. **Deep-read in parallel**: call the `spawn_agent` tool with `agent_type = "tm-source-reader"` once per source, all at once (at most 6 running together; wait for every one), each writing to `docs/research/<slug>/sources/`. This partition is safe: the sources are genuinely independent, and nothing of value lives *between* them.
3. **Synthesize**: call the `spawn_agent` tool with `agent_type = "tm-researcher"`, which finds the notes and composes the report from them instead of re-fetching.

Cap the fan-out at the sources that genuinely matter and **name any source you dropped** in the report's Scope. A survey that quietly stopped at five reads like a survey that found five.

## After it returns
Show a short summary: the key findings with their sources, which claims rest on **secondary** sources, any **conflicts between sources**, the implications for the design, and any open questions. This report is an input to `$thasmorato-skills:tm-hld` and `$thasmorato-skills:tm-fdd`.

Research is not gated; it informs decisions rather than committing to them. If a finding changes the architecture, that shows up at the HLD gate.
