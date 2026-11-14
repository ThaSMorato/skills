> Part of the `doc-validate` skill (see `SKILL.md`). Also read by the writers of the living documents (`prd-writer`, `hld-writer`, `component-mapper`, `boundary-architect`, `decomposer`, `fdd-writer`) and by `acceptance` when it absorbs criteria.

# Living documents: amend, never rewrite

The documents under `docs/product/`, `docs/architecture/` and `docs/features/` describe **the system as it is now**, not the effort that changed it. Each effort edits them on its branch: `main` says what the system does, the branch says what it will do, and the merge applies the change. Their history is the git log and the ADRs, never the document itself.

Two kinds of document never mix:
- **State** (living): the PRD, the HLD, the component map, the boundary contract, the feature index, each feature's `README.md`, `prd.md` and `fdd.md`. Edited in place.
- **Record** (immutable): the ADRs. A decision changes only through a new ADR that `amends` or `supersedes` the old one.

What belongs to one effort lives in `.scratch/<effort>/` and dies with it: the brief, the decomposition, the scope (`scope.md`: the milestone, the requirements this effort adds, changes or removes, the product criteria) and the acceptance criteria per feature (`criteria/<feature>.md`).

## For the writer
**New or existing.** When the target does not exist, fill the template and write the whole file. When it exists, it is living: read it whole, then amend it **section by section with `Edit`**. Rewriting an existing file with `Write` erases what earlier efforts decided, and nothing downstream notices.

**Amend only what this effort changes.** Each edit traces to the effort's source (the brief, the scope, the decomposition, the HLD). A section the effort does not touch stays byte for byte. Content marked `> Decided:` is the owner's: change it only when the source changes that very decision.

**Ids are permanent addresses.** Never renumber and never reuse one (`RF-007`, `F3`, a component name, a rule id): other documents, tickets and tests are keyed on them. A new element takes the next free id; a removed one goes to the document's `Retired` section, struck through, with the reason.

**Present tense, the whole system.** Write what the system does, not what changed: no "new", "now", "previously", "as before", "added in this effort", no markers of new or existing elements. The delta is the diff of the file on the branch, and the effort's own files say why.

**No acceptance criteria.** A criterion is the yardstick of one delivery and lives in `.scratch/<effort>/`. A living document states the behavior as a rule; `acceptance` turns a delivered criterion into one (`${CLAUDE_PLUGIN_ROOT}/skills/acceptance/absorb.md`).

**Link, don't just name.** A reference to another document's id is a relative Markdown link to that document's file, by [`links.md`](links.md).

**Cite symbols, never `path:line`.** A living document names the function, the type, the endpoint, the config key. A line number is false after the next commit.

**A changed decision is reported, not buried.** When an amendment changes what the document had decided (as opposed to adding to it), report it in your return, one line each: the section, what it said, what it says now, and the source that changed it. The command shows the list and names `/tm-adr-identify`, which turns each into an ADR that `amends` or `supersedes` the old one. A decision changed in place and not reported leaves no trace of why it changed.

## For the validator (`RG-N`)
On a branch, compare the amended document with its version on the base branch (`git diff <base>...HEAD -- <path>`; the base is the branch the effort will merge into, `main` when nothing says otherwise). A **regression** is:
- an element removed or changed that the effort's source does not ask to change;
- an id renumbered or reused;
- a `> Decided:` changed with no source behind it;
- a changed decision with no ADR, no Potential ADR and no line in the writer's return that reported it;
- text about the change instead of the system ("new", "previously", "added in").

The ceiling: a reworded sentence that says the same thing is not a finding.
