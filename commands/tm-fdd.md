---
description: Write a Feature Design Doc for one feature, from the HLD (docs/architecture/hld.md).
argument-hint: "<feature name or slug> [effort slug]"
disable-model-invocation: true
---

Call the Agent tool with `fdd-writer` to write or amend the Feature Design Doc, `docs/features/<feature-slug>/fdd.md`, with the feature's `README.md`, and to write this effort's acceptance criteria for it, `.scratch/<effort>/criteria/<feature-slug>.md`, for: $ARGUMENTS

The FDD is living: an existing one is amended, never rewritten, and it carries no acceptance criteria. The effort is the slug `/tm-interview` gave this work: take it from the argument, or use the only `.scratch/*/decomposition.md` that lists this feature; with more than one and no argument, ask which. Pass the agent both.

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

If no feature was given, ask which feature to spec. If `docs/architecture/hld.md` doesn't exist, tell the user to run `/tm-hld` first instead of delegating.

After the agent returns, show a short summary: the public contracts, the chosen test seams, the criteria and what each refines, the legacy FDDs folded in (each for the owner to delete or keep), and any `> Needs Input` markers (these block approval) and every `> Assumed:` marker, grouped, for the user to confirm or correct. Don't edit the FDD yourself; if changes are needed, re-run the agent with the correction. The one edit you make directly is rewriting a confirmed `> Assumed:` as `> Decided:` (the `asking` skill §5).

**Decisions the amendment changed** (the agent returns them, one line each): show every one, then name `/tm-adr-identify`, which records each as an ADR that amends or supersedes the old decision. A changed decision with no ADR is a regression `/tm-doc-validate` reports.
