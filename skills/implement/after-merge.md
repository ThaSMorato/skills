> Part of the `implement` skill (see `SKILL.md`). Also read by the `pr` skill's preflight and by `/tm-flow`.

# After a merge or rebase that resolved a conflict

Resolving a conflict makes the files agree; it does not make the work agree with what the other branch brought. The other side may have added a dependency, changed a schema whose code is generated, or moved code an acceptance criterion rests on. Until the steps below run, the ticket's green suite and its acceptance record describe a branch that no longer exists.

Who resolves a conflict is the owner's call. A conflict met while updating with the base stops the run and is reported with its files, unless the owner said to resolve it; a resolution is never guessed in silence.

Start from what came in: `git diff --name-only ORIG_HEAD HEAD` right after the merge or the rebase (the next one moves `ORIG_HEAD`), and the files that had a conflict (`git diff --name-only --diff-filter=U` while it is in progress, the resolution after).

1. **Install** what the other branch brought. A manifest or lockfile among the incoming files (`package.json` and its lockfile, `Gemfile.lock`, `go.sum`, `requirements*.txt`, `poetry.lock`) means the installed dependencies no longer match it. Install with the repo's command (`docs/guidelines.md`) when the `## Workspace` allows it; otherwise ask the owner to.
2. **Regenerate** what is generated. A source of generated code among the incoming or resolved files (a schema with a generated client, an OpenAPI spec with generated types, a GraphQL schema, a protobuf, migrations with a schema dump) is regenerated with the repo's command. A generated file whose conflict was resolved by hand is regenerated anyway: a hand-merged generated file is a third version that nothing generated.
3. **Rerun the area**, through the `test-runner` agent: the tests of every file that had a conflict, and of every incoming file this ticket's files import or are imported by, then the type check. A failure here belongs to the merge and is recorded as such, never to an SI; it gets the same three attempts.
4. **Recheck acceptance.** Every acceptance criterion whose files had a conflict or were changed by the incoming side is stale, whatever the record's `verified_at` says. List each in `progress.md` under `## Open prerequisites` (`AC-2: acceptance to redo after the merge of <ref>`); the owner runs `/tm-acceptance <slug>`, and the ticket is not reported done until they have.

Record the merge in `progress.md` under `## Learned`: the ref, the files that had a conflict, what was installed and regenerated, and the area's result.
