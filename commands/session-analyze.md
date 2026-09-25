---
description: Read a whole working session — every compaction segment — and report where the owner had to correct, reject or repeat something, tagged as a problem of the flow or of this project, with the repeats across segments first.
argument-hint: "(optional) session id — default: the most recent session of this directory"
---

Analyze the working session: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

`/retro` reads what the work left on disk. This reads what only the conversation holds: the owner correcting a proposal, rejecting a question, asking for the same thing twice. `/compact` shrinks the context window but deletes nothing from the transcript, so the whole session, every segment, is still there to read.

## 1. Extract
Check that Node is available (`node --version`). If it is not, say so and stop: the extractor needs it, and a 200 MB transcript cannot be filtered by reading it.

Run:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/session-extract.mjs" [--session <id>]
```

With no id it takes the most recent session of the current directory. It writes `.scratch/session-analyze/<session-id>/`, with one `seg-NN.md` per compaction segment and an `index.md`, and prints a JSON summary. It keeps what the owner said, answered and rejected, plus the assistant's text and the **names** of the tools it called. It drops file snapshots, tool results and arguments (where file contents and secrets live), thinking, subagent turns and the compaction summaries.

## 2. Fan out, one agent per segment
Dispatch `session-segment-analyst` for **every** segment **in a single message**, so they run in parallel, each with its segment's path and the index path. A segment fits one agent whole, so there is no chunking and no summarizing, and each agent reads the original conversation rather than a summary of a summary.

## 3. Synthesize — repetition is the signal
- **Merge** findings that are the same problem seen twice.
- **Put repetition first.** A finding whose owner turns appear in two or more segments is the strongest evidence this suite can get that a stage is wrong: the owner said it once, the flow did not learn, and they had to say it again.
- **Drop any finding without an owner turn** (uuid, timestamp, quote). No exceptions: this is the rule that keeps the report from becoming narrative.
- Keep each finding's `flow` / `project` tag. When two agents tagged the same problem differently, `project` wins unless the evidence shows it would recur on any project.

## 4. Write
Write `docs/meta-retro/<YYYY-MM-DD>-<session-id>.md`, filling `${CLAUDE_PLUGIN_ROOT}/templates/meta-retro.md`. It lives in the project: a finding can be specific to it.

Then show the repeated findings first, then the counts by tag, and ask what to act on. This stage records; it changes nothing. A `flow` finding is an improvement to propose to the plugin, and a `project` finding is a skill or guide for this project, each made by whoever owns that file.
