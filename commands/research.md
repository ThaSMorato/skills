---
description: Investigate a technical question against primary sources, producing a cited report that feeds the HLD/FDD.
argument-hint: "<the research question>"
---

Investigate: $ARGUMENTS

## Narrow question — one agent
Use the `researcher` agent — run it in the background so you can keep working while it reads. It surveys, deep-reads, and writes `docs/research/<slug>.md`.

## Broad question — fan out the deep-read
When the question spans several sources that must each be read carefully (comparing three libraries, reading four specs), reading them all in one context runs out of room and the last source gets skimmed. Split it:

1. **Survey** — identify the sources that own the answer, with a short `WebSearch` pass in this context.
2. **Deep-read in parallel** — dispatch one `source-reader` per source, in a single message, each writing to `docs/research/<slug>/sources/`. This partition is safe: the sources are genuinely independent, and nothing of value lives *between* them.
3. **Synthesize** — run the `researcher` agent, which finds the notes and composes the report from them instead of re-fetching.

Cap the fan-out at the sources that genuinely matter and **name any source you dropped** in the report's Scope. A survey that quietly stopped at five reads like a survey that found five.

## After it returns
Show a short summary: the key findings with their sources, which claims rest on **secondary** sources, any **conflicts between sources**, the implications for the design, and any open questions. This report is an input to `/hld` and `/fdd`.

Research is not gated — it informs decisions rather than committing to them. If a finding changes the architecture, that shows up at the HLD gate.
