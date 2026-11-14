---
name: tm-prd
description: "Write the PRD from the requirements brief (.scratch/<effort>/brief.md)."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (optional) the effort slug, or a path to the brief


Call the `spawn_agent` tool with `agent_type = "tm-prd-writer"` to write or amend the PRD, `docs/product/prd.md`, and to write this effort's scope, `.scratch/<effort>/scope.md`, from the effort's requirements brief (`.scratch/<effort>/brief.md`, or the path given). The PRD is living (the whole system); the scope holds what is this effort's alone: the requirements it adds, changes or removes, its first milestone and its product acceptance criteria. When the brief says `Level: feature`, the PRD is the feature's, `docs/features/<feature>/prd.md`: pass the agent the feature, the index row the brief's title matches, and ask which when none or several match. The effort is the slug `$thasmorato-skills:tm-interview` gave this work, the folder under `.scratch/`: take it from the argument, or use the only `.scratch/*/brief.md` there is; with more than one and no argument, ask which.

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

If the brief doesn't exist, tell the user to run `$thasmorato-skills:tm-interview` first instead of delegating.

After the agent returns, show a short summary: which sections were filled or amended, which optional sections were pruned, the scope (requirements by change, the first milestone, the product criteria), and any `> Needs Input` markers (these block approval) and every `> Assumed:` marker, grouped, for the user to confirm or correct. Don't edit the PRD yourself; if changes are needed, re-run the agent with the correction. The one edit you make directly is rewriting a confirmed `> Assumed:` as `> Decided:` (the `asking` skill §5).

**Decisions the amendment changed** (the agent returns them, one line each): show every one, then name `$thasmorato-skills:tm-adr-identify`, which records each as an ADR that amends or supersedes the old decision. A changed decision with no ADR is a regression `$thasmorato-skills:tm-doc-validate` reports.
