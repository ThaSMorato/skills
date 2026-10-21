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

No skill carries `disable-model-invocation`. Every command reaches its skill through the Skill tool, and the flag refuses that call too (0.6.4), so a flagged skill would be unreachable from its own command. The user reaches a stage by typing its command.

When it's skill × command × agent: see [`docs/anatomy/plugin-anatomy.md`](../docs/anatomy/plugin-anatomy.md). How to write one: [`docs/anatomy/skill-anatomy.md`](../docs/anatomy/skill-anatomy.md).
