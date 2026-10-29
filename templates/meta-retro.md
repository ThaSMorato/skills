<!--
TEMPLATE: meta-retro (what one working session taught about the flow and the project)
Filled by /tm-session-analyze from a session transcript, across every compaction segment.
EVERY FINDING RESTS ON AN OWNER TURN: uuid, timestamp, the owner's own words. The assistant
criticizing itself is not evidence. Where the conversation cannot answer something, say so.
The written file STARTS with the frontmatter below; this comment is not copied.
-->

---
kind: meta-retro
plugin_version: <the "version" in ${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json>
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
session: <session id>
analyzed_at: <YYYY-MM-DD>
segments: <n>
owner_turns: <n read>
findings: {flow: <n>, repo-skill: <n>, repo-code: <n>}
promotable: <n repo-skill findings that passed the promotion filter>
repeated: <n findings seen in more than one segment>
cost: {minutes: <n>, idle_minutes: <n>, tool_calls: <n>, invocations: <n>, other_answers: <n>, clarifications: <n>, overrules: <n>}
---

# Meta-retro: session <session id>

## Repeated across segments (required)
> The high-value section. The same correction, rejection or request in two or more segments means the
> flow did not learn it the first time. Each item lists every instance: segment, uuid, timestamp, quote.
> `none` if nothing repeated.

## Flow findings (required)
> Problems the plugin's process would have on any project. Each: the pattern, the owner turn (uuid ·
> timestamp · quote), the stage running, and the change, naming the command, skill, agent or template.
> These become improvements to the plugin.

| Pattern | Owner turn | Stage | Change |
|---|---|---|---|

## Repo findings (required)
> Specific to this codebase or this owner, by level (`skills/retro/levels.md`): `repo-skill` (its skills,
> guides and `CLAUDE.md`) or `repo-code` (its code and configuration). Same columns, plus the promotion
> filter (`skills/retro/promotion-filter.md`) for a `repo-skill` one: `passes`, or the question it failed.
> Only a finding that passes is proposed as a skill or a guide in this project.

| Level | Pattern | Owner turn | Stage | Change | Filter |
|---|---|---|---|---|---|

## Environment (required when any signal or repeated correction exists)
> From `skills/retro/environment.md`: navigation, tool economy and information access, which only a
> session shows. Evidence is the segment and the tool-call names the extract kept (a run of searches
> before a file was found, a costly call repeated), or an owner turn when there is one. Each finding is
> read on two tracks: what it cost this session, and what change to the environment prevents it.

| Category | Evidence (segment · tool calls or owner turn) | Tactical cost | Strategic change | Mechanical / judgement | Where it lands |
|---|---|---|---|---|---|

## Cost by stage (required)
> From the extract's `index.md`, copied, not estimated: per stage (the owner's invocation to the next),
> active minutes (pauses over 30 minutes are idle), tool calls, invocations (a stage re-run is the owner
> restarting it), answers outside the options, questions rejected to clarify, overruled recommendations.
> Wasted calls come from the segment analysts' tool-economy signals, with their segment. In Codex, the
> answer columns are `not measured`.

| Stage | Minutes | Idle | Tool calls | Invocations | Other answers | Clarifications | Overrules | Wasted calls (segment) |
|---|---|---|---|---|---|---|---|---|

## What the conversation couldn't tell me (required)
> Segments too thin to judge, tool results that were dropped by design, anything a reader might
> expect this report to cover that the transcript does not show.
