> Part of the `retro` skill (see `SKILL.md`). Also read by `/session-analyze`.

# The environment lens: what would make the next run better

The rest of a retro is about the work. This lens is about the **environment the agent worked in**: the repository's checks, its steering files, its docs, the information the agent could reach. A mistake the environment could have prevented will come back on every later ticket until the environment changes, so this is where one finding pays for many runs.

## Two tracks
Read every finding on two tracks:
- **Tactical**: what it cost this ticket, and how it was resolved.
- **Strategic**: what change to the environment makes the next ticket go right without anyone remembering this one.

A retro that stops at the tactical track records history. The strategic track is what it is for.

The strategic target is a **pit of success**: an environment where the correct move is the easy one. Narrow interfaces that are hard to misuse, lint rules that make the wrong code fail, a review standard that names the convention, logs and test data the agent can read. And **no workarounds**: a one-off hack that bypasses an established process, or a deviation from a convention, is fixed at its source before more feature work is built on it, and a retro that finds one proposes that fix.

## The categories
Each category has its own evidence. Cite it, as everywhere in a retro; a category with no evidence in scope is skipped, not guessed.

| Category | Look for | Evidence |
|---|---|---|
| **Navigation** | The agent spent effort finding a file, a convention or a hidden dependency between files; a pointer would have sent it straight there. | `progress.md` notes, review findings of the "missed the existing X" kind, `pattern-scout` analogues found late; session evidence from `docs/meta-retro/` |
| **Automated checks** | A mistake a linter, the type checker, a test or a filesystem check could have caught. | review findings, failed deliverables, `escalations` |
| **Guardrail** | The repository has no barrier at all: no pre-commit hook and no CI job running its lint, type check and tests. | the repo itself: `.husky/`, `.pre-commit-config.yaml`, `lefthook.yml`, `.github/workflows/`, `.gitlab-ci.yml`, the `package.json` (or build tool) scripts |
| **Coding standards** | The review missed a mistake, or a rule it enforces is unclear, stale or never fires. | review files, `by_lens`, `refuted_by_lens` |
| **Steering files** | `CLAUDE.md` / `AGENTS.md` carries instructions that belong in a standard or a check, or instructions that change nothing (the model already does it, or nothing in scope ever triggered it). | the files themselves, against what the artifacts show the agent did |
| **Tool economy** | Expensive tool calls that a script, a narrower command or a better-shaped tool would replace. | session evidence only (`docs/meta-retro/`); without it, name this under what the artifacts couldn't tell |
| **Information access** | A fact the agent needed was out of reach: dev server logs, a test database, read access to a third-party service, a browser to see the UI. | `unverified` items, `> Assumed:` marks, `Not verified` sections, escalations that ended in "could not observe" |

**Read the repository's own check command first** (its `lint` / `check` / `test` scripts, its CI workflow) before proposing a check. A check that already exists but is not wired, or is silently broken, is the finding; a new one would duplicate it.

**A repository with no guardrail is a finding in itself**, even when nothing in scope went wrong: it is a standing missed chance, not a neutral default. The fix is `/guardrails`; when it already ran, `docs/guardrails.md` says what was installed and how it was proven.

## Mechanical or judgement
Before proposing where a coding-standards finding lands, classify it:
- **Mechanical**: a fixed syntactic pattern, a banned API, an import shape, a file-location rule, a naming pattern a regex can see. It becomes a **deterministic check**: a rule in the repository's own linter, a pre-commit hook, or a CI job, whichever its language and existing guardrail make cheapest. Prose is the fallback only when no check can express it, and then say why.
- **Judgement**: consistency across files, "matches the surrounding style", a trade-off. It becomes a line in the stack guide or the review standard, read by `review-standards` during review.

Checks over prose: a check fires every time at no attention cost, and a rule in prose fires only when someone reads it at the right moment.

## Where standards are enforced
The **review** enforces standards, not the implementation. The implementer carries the most context pressure (exploring, writing, debugging); the reviewer receives a diff and has room to apply a long list. So a standard lands in a stack guide or the review standard that `review-standards` reads, and the steering file (`CLAUDE.md`) keeps only **pointers** to where things are. A steering file that grows rules is a finding under **Steering files**.

## Output
Each environment finding carries: the category, the tactical cost (cited), the strategic change, **mechanical** or **judgement** when it is a standard, and **where it lands** (the check to add, the file to change, the access to grant). It still passes `promotion-filter.md` before it is proposed as a guide or a rule; a mechanical finding that passes is proposed as a check.
