---
description: Write the PRD from the requirements brief (.scratch/<effort>/brief.md).
argument-hint: "(optional) the effort slug, or a path to the brief"
disable-model-invocation: true
---

Call the Agent tool with `prd-writer` to synthesize a PRD into `docs/product/prd.md` from the effort's requirements brief (`.scratch/<effort>/brief.md`, or the path given). The effort is the slug `/tm-interview` gave this work, the folder under `.scratch/`: take it from the argument, or use the only `.scratch/*/brief.md` there is; with more than one and no argument, ask which.

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

If the brief doesn't exist, tell the user to run `/tm-interview` first instead of delegating.

After the agent returns, show a short summary: which sections were filled, which optional sections were pruned, and any `> Needs Input` markers (these block approval) and every `> Assumed:` marker, grouped, for the user to confirm or correct. Don't edit the PRD yourself; if changes are needed, re-run the agent with the correction. The one edit you make directly is rewriting a confirmed `> Assumed:` as `> Decided:` (the `asking` skill §5).
