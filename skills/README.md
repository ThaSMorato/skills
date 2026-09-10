# skills/

**Model-invoked** skills (or interactive via a command wrapper). They run in the **main context**, so they talk to the user live — use them for anything HITL (interview, gates) and for reusable primitives.

| Kind | Skills |
|---|---|
| Doc & design | `interview`, `domain-model`, `design` |
| Dev loop | `plan`, `implement`, `tdd` |
| Verification | `plan-validate`, `doc-validate` |
| Generators | `generate-test-guide`, `generate-stack-guide` |
| References | `testing`, `code-smells`, `clean-code`, `architecture`, `security` |

The reference skills are **routers**: a short index plus `rules/` or sibling files, read only when a row matches. That shape is the point — a stage that needs one rule shouldn't pay for the catalog.

The verification skills carry `disable-model-invocation: true`, as do `plan`, `implement`, `design` and the generators: they are consequential enough that firing them by accident is worse than the user typing the command.

When it's skill × command × agent: see [`docs/anatomy/plugin-anatomy.md`](../docs/anatomy/plugin-anatomy.md). How to write one: [`docs/anatomy/skill-anatomy.md`](../docs/anatomy/skill-anatomy.md).
