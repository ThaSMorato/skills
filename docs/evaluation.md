# v0.7 behavioral evaluation

Version 0.7.0-beta.1 stays prerelease. Static contracts and deterministic utility tests do not establish better model behavior, model discovery, cost or latency. The real-use evaluation of 0.6.1/0.6.2/0.6.3 in the source backlog remains a release gate; this change does not invent those measurements.

## Discovery across models

Use two available models in isolated temporary projects. For each core skill, prepare a realistic positive request and a near-miss request belonging to a sibling. Give the evaluator descriptions and minimum raw fixtures only; hide this document, backlog, intended answer and author commentary. Record request, model/version, harness, selected skill, artifact, false positive/negative and elapsed time. Compare actual behavior; exact wording is not the oracle. Run no external mutations. This is a behavioral test protocol, not a claim that multi-model evaluation has run.

## Codex review spike

In a disposable repository with a concrete diff, invoke `$tm-review` against a fixed commit. Include a defect one call outside the diff, an already-handled case and a UI-free change. Check all eight mandatory lenses ran, UI was explicitly skipped, synthesis merged duplicates, the verifier cited evidence, and a durable review recorded counts/verdicts. Repeat with UI to exercise the ninth lens. Under a small concurrency limit, queue every lens; with no delegation, report serial execution explicitly. Verify child agents never delegate or invoke another stage. The author and reviewer must be independent; the owner chooses the handoff. Do not automatically trigger another harness.

The plugin packages TOML definitions but does not auto-register them as installed custom agents. The wrapper can pass agent-specs instructions to the host spawn facility; optional installation is documented in the generated Codex adapter. Both paths need live client evaluation before release.

## Regression scenarios

- Existing feature FDD gains a rule: preserve unrelated rules and IDs; no task-named FDD, no AC checklist or history; changed decisions produce a new ADR. Absorb passing story ACs after acceptance.
- Legacy task FDDs disagree: propose grouping and resolve with delivered code/ADRs; do not silently delete either.
- A clean plan changes by one byte: implementation refuses it. Amending one pending SI keeps completed IDs and evidence.
- Ticket generation, dirty validation, retro and session analysis each deliver and stop; no author/validator loop. Retro tags team ticket formatting repo-skill, an implementation defect repo-code, a general stage defect flow.
- Backend acceptance records an executed .http block and redacted response; unavailable upstream blocks dependents without falsely failing them. Exploratory browser checks only suggest cases.
- Report registry contains moved repo and absent report: flow report names them, continues with available reports, keeps only flow findings and separates harness/version populations.

## Model and effort experiment

Agent effort is deterministic: high for writers/analysis/research/review; medium for mechanical generators. Main-context skills retain the session effort. Compare an owner-selected Claude Opus planning/validation and Sonnet implementation profile with the current session model; Codex uses a locally available owner-selected model. Do not pin a vendor model into the neutral core or switch models behind the owner's back. The proposed Claude-author/Codex-validator split is a hypothesis, not a routing mandate.

Record artifact quality, confirmed/refuted review findings, gate runs, cost and elapsed time by plugin_version, harness and model. Keep unknown measurements unknown. Promote to stable only after real-use results support it.

## Structural gate assessment

Claude `user-invocable: false` hides menu entries but allows model loading. `disable-model-invocation` would break command wrappers. A Skill hook cannot reliably infer owner intent solely from the tool name, and Codex does not share that hook contract. This release therefore uses explicit stop instructions and regression lint; it does not claim a runtime security boundary or install a hook that blocks valid command dispatch.

References: [Claude plugin paths and data](https://code.claude.com/docs/en/plugins-reference#environment-variables), [Claude subagent effort](https://code.claude.com/docs/en/sub-agents), [Codex package format](https://developers.openai.com/plugins/build/plugins), [Codex custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
