# skills/

**Model-invoked** skills (or interactive via a command wrapper). They run in the **main context**, so they talk to the user live; use them for anything HITL (interview, gates) and for reusable primitives.

| Kind | Skills |
|---|---|
| Doc & design | `interview`, `questionnaire`, `domain-model`, `ui-audit`, `ui-design`, `design`, `prototype` |
| Dev loop | `plan`, `implement`, `tdd`, `trim`, `tidy`, `acceptance`, `walkthrough`, `pr`, `diagnose` |
| Verification | `doc-validate`, `tickets-validate`, `plan-validate` |
| Generators | `generate-test-guide`, `generate-stack-guide` |
| Repository setup | `guardrails` |
| Looking back | `retro`, `flow-report` |
| Learning | `teach` |
| Session | `wait-what`, `handoff` |
| Writing | `writing-fragments` (explore), `writing-beats`, `writing-shape` (exploit) |
| References | `testing`, `code-smells`, `clean-code`, `architecture`, `security`, `data-access`, `ui`, `visuals` |

The reference skills are **routers**: a short index plus `rules/` or sibling files, read only when a row matches. That shape is the point: a stage that needs one rule shouldn't pay for the catalog.

Every stage skill carries `disable-model-invocation: true`, and so does every command: only the owner typing a command starts a stage, and a stage never starts another (the stop rule, 0.6.7). A command reaches its closed skill by reading the file, not through the Skill tool, which the flag refuses. The reference skills stay open: any stage, agent or the model itself loads them.

When it's skill × command × agent: see [`docs/anatomy/plugin-anatomy.md`](../docs/anatomy/plugin-anatomy.md). How to write one: [`docs/anatomy/skill-anatomy.md`](../docs/anatomy/skill-anatomy.md).
