---
description: Write the High-Level Design from the PRD (docs/product/prd.md).
argument-hint: "(optional) path to the PRD, if not docs/product/prd.md"
disable-model-invocation: true
---

Call the Agent tool with `hld-writer` to write or amend the High-Level Design, `docs/architecture/hld.md` (living: an existing one is amended, never rewritten), from the PRD ($ARGUMENTS, or `docs/product/prd.md` by default).

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

If the PRD doesn't exist, tell the user to run `/tm-prd` first instead of delegating.

After the agent returns, show a short summary: the components and main flows, the cross-cutting drivers, any `> Needs Input` markers (these block approval) and every `> Assumed:` marker, grouped, for the user to confirm or correct, and any decisions flagged as ADR candidates. Don't edit the HLD yourself; if changes are needed, re-run the agent with the correction. The one edit you make directly is rewriting a confirmed `> Assumed:` as `> Decided:` (the `asking` skill §5).

**Decisions the amendment changed** (the agent returns them, one line each): show every one, then name `/tm-adr-identify`, which records each as an ADR that amends or supersedes the old decision. A changed decision with no ADR is a regression `/tm-doc-validate` reports.
