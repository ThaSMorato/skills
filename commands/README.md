# commands/

**User entrypoints** — a prompt fired by `/name`, run in the main context. Thin by design: a command orchestrates, delegates heavy generation to agents, composes skills, and makes sure the inputs are on disk before handing off to an isolated context.

Each stage command carries a **preflight** (does the input exist? if not, name the command that produces it) and a **postflight** (what came out, what needs attention, what to run next). That pair is what makes stages composable outside `/flow`.

`/flow` is the coordinator. It reads state from the artifacts on disk rather than from a status file, so every other command runs standalone and none of them owes `/flow` an update.

How to write one: [`docs/anatomy/command-anatomy.md`](../docs/anatomy/command-anatomy.md).
