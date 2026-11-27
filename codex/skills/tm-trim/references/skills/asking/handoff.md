> Part of the `asking` skill (see `references/skills/asking/index.md`). Read when a stage ends: naming what comes next, reporting a ticket's criteria, or reporting its blockers.

## 7. Hand off to the next stage

A stage ends by naming what comes next, and that name is the one thing the owner acts on without checking it.

- **Read the disk before naming it.** The next stage is the one the artifacts say is next (the files, their `status:`, the validation's hash), read now, not the one this conversation assumed: another session may have finished a step, and the owner may have edited a file.
- **A stop report in a ticket's loop opens with its criteria**, before anything else, one row each:

  | AC | State | Blocked by |
  |---|---|---|
  | `AC-1` *"the export lists every entry of the month"* | done, tested by `export.test.ts` | none |
  | `AC-2` *"an empty month exports a header only"* | not started | ticket `01: ledger read model`, in review (PR #7) |

  The state uses the stage's own words (done, in progress, not verified, blocked), and the blocker is resolved like any id.
- **An open prerequisite is repeated until it is resolved.** A tracker id that does not exist yet, a server nobody started, a document validation still `dirty`: write it to `progress.md` under `## Open prerequisites` (or to the stage's own output when there is no progress file), and list it in every "Next" from then on, with what it blocks. A prerequisite said once, three reports ago, is one nobody remembers.
- **The blockers come from the script.** Before naming a stage that depends on another ticket, `node "references/scripts/blocker-state.mjs" <ticket file>` prints the branch and whether it is a linked worktree, how far it is from the base, and each blocker's state: `merged`, `in review` (with its pull request), `implemented, no PR`, `in progress`, `not started`. Work can build on a blocker `in review` by stacking on its branch: say so, rather than calling the ticket blocked. When it prints `pr_lookup: unavailable`, the states come from the disk alone; say that too.
