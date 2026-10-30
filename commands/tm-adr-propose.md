---
description: Triage one decision the owner wants to make ("adopt X", "stop doing Y") before anything is planned on it (new, amends an ADR, supersedes one, or already decided) and record it as a Potential ADR.
argument-hint: "\"<the decision, in your words>\""
disable-model-invocation: true
---

Call the Agent tool with `adr-analyzer` in its one-decision mode (its `## One decision (triage)` section), passing the decision in the owner's words: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

A decision announced in a conversation ("let's use Redis for the sessions") is the one the sweep of `/tm-adr-identify` never sees: it lives in no design document yet. Planned on directly, it lands in code without a record, or contradicts an ADR nobody reread. This command puts it through the same triage first.

Preflight: a decision was given; if not, ask for it in one sentence. If `docs/adr/` does not exist, say that this is the project's first ADR and continue.

After the agent returns, show the triage:
- **already decided**: the ADR that says it, with its title, and stop;
- **not ADR-worthy**: the reason from the funnel, and stop;
- otherwise the relationship (`new`, `amends` or `supersedes`, each ADR by number and title), the scope, the requirements and features it binds, whether it is retroactive, and every `> Needs Input:`, as one structured question when the relationship has two readings.

Postflight: the path to the Potential ADR, and the next command, which the owner runs:

`/tm-adr-generate <potential>`
