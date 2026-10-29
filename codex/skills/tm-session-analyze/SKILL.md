---
name: tm-session-analyze
description: "Read a whole working session (every compaction segment) and report where the owner had to correct, reject or repeat something and what in the environment got in the way, each tagged with the level it would change (the plugin's flow, this repo's skills, or its code), with the repeats across segments first."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (optional) session id, default: the most recent session of this directory


Analyze the working session: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

`$thasmorato-skills:tm-retro` reads what the work left on disk. This reads what only the conversation holds: the owner correcting a proposal, rejecting a question, asking for the same thing twice. `/compact` shrinks the context window but deletes nothing from the transcript, so the whole session, every segment, is still there to read.

## 1. Extract
Check that Node is available (`node --version`). If it is not, say so and stop: the extractor needs it, and a 200 MB transcript cannot be filtered by reading it.

Run:

```
node "references/scripts/session-extract.mjs" --harness codex [--session <id>]
```

With no id it takes the most recent session of the current directory. It writes `.scratch/session-analyze/<session-id>/`, with one `seg-NN.md` per compaction segment and an `index.md`, and prints a JSON summary. It keeps what the owner said, answered and rejected (a message sent mid-turn included, as a `queued` turn), the slash commands they ran (with their arguments), and the options each structured question offered, plus the assistant's text and the **names** of the tools it called. It drops file snapshots, tool results and the other tools' arguments (where file contents and secrets live), thinking, subagent turns and the compaction summaries. In Codex the extractor reads the Codex rollout instead (`--harness codex`) and keeps the same, except denied approvals and answers to structured questions, which a rollout does not record in a form it can rely on yet: say so in the report when the session ran in Codex. A Codex wrapper is named with the tools it called inside (`exec(exec_command, apply_patch)`), or `exec(opaque)` when they cannot be named safely.

The index also carries a **Cost by stage** table, computed from the turns: per stage (from the owner's invocation to the next), the active minutes (a pause over 30 minutes is idle, kept apart), the tool calls, the invocations, the answers outside the options offered (`Other`), the questions rejected to clarify, and the answers that overruled a `(Recommended)` option. In Codex the last three are `not measured`.

## 2. Fan out, one agent per segment
Call the `spawn_agent` tool with `agent_type = "tm-session-segment-analyst"` for **every** segment **at once** (at most 6 running together; wait for every one), so they run in parallel, each with its segment's path and the index path. A segment fits one agent whole, so there is no chunking and no summarizing, and each agent reads the original conversation rather than a summary of a summary.

## 3. Synthesize: repetition is the signal
- **Merge** findings that are the same problem seen twice.
- **Put repetition first.** A finding whose owner turns appear in two or more segments is the strongest evidence this suite can get that a stage is wrong: the owner said it once, the flow did not learn, and they had to say it again.
- **Drop any finding without an owner turn** (uuid, timestamp, quote). This is the rule that keeps the report from becoming narrative. The one exception is the **Environment** section below, whose evidence can be the segment and the tool-call names the extract kept.
- Keep each finding's level (`references/skills/retro/levels.md`). When two agents gave the same problem different levels, the lower one wins unless the evidence shows it would recur on any project.
- **Filter what gets promoted.** Before a `repo-skill` finding's change says "make it a skill" or "add it to a guide", run it through `references/skills/retro/promotion-filter.md`: not findable in five minutes, specific to this codebase, cost real effort, and a trigger the task will actually contain. One that fails stays a finding, marked with the question it failed; it is not proposed as a skill or guide.

## 3b. The environment: this stage owns it
A session shows what no artifact records, so this is where the environment lens (`references/skills/retro/environment.md`) runs in full, on its two tracks: what each problem cost this session, and what change to the environment prevents it next time.
- **From the segment analysts' environment signals** (tool-call names, the one exception to the owner-turn rule): navigation (a run of searches before the file was found), tool economy (a costly call repeated), information access (something the agent could not see).
- **From owner turns**: a correction the owner had to make twice about the same convention is a standard; classify it **mechanical** (propose the lint rule, hook or CI job that would catch it) or **judgement** (a line in the stack guide or the review standard). A `CLAUDE.md` instruction the owner had to repeat is not working where it is: say what should replace it (a check, a pointer, a skill).
- Give each environment finding its level like every other finding: a gap in the plugin's own stages is `flow`.
- Order the environment findings most severe first, as the lens says.

`$thasmorato-skills:tm-retro` reads these sections for the session side of its environment, so write them even when they are short.

## 3c. The cost
Copy the Cost by stage table from the index.md into the report, and sum it into the frontmatter's `cost`. The one column the extract cannot count is the wasted calls: take them from the segment analysts' tool-economy signals (a costly call repeated, a chain one command would replace), per stage, citing the segment. The extract counts; the analysts judge; nothing in this table is estimated.

## 4. Write
Write `docs/meta-retro/<YYYY-MM-DD>-<session-id>.md`, filling `references/templates/meta-retro.md`. It lives in the project: a finding can be specific to it.

Record the report: `node "references/scripts/report-registry.mjs" record docs/meta-retro/<YYYY-MM-DD>-<session-id>.md` adds it, with its counts by level, to the registry `$thasmorato-skills:tm-flow-report` reads.

**Then stop.** Show the repeated findings first, then the findings by level. A `flow` finding is never applied here: it waits for `$thasmorato-skills:tm-flow-report`. Each `repo-skill` and `repo-code` finding names the stage that owns its file, for the owner to run if they choose. This stage records; it changes nothing.
