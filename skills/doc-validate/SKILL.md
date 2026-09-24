---
name: doc-validate
description: Validate one design document against the one it came from before the human gate — coverage in both directions, contradictions, glossary drift, unanswered non-functional requirements, unfilled required sections — and emit a clean/dirty verdict. Use after /prd, /hld, /decompose or /fdd, on "validate the docs / is the PRD ready / check the HLD against the PRD".
disable-model-invocation: true
---

Read a source document and the document derived from it, and decide whether the derivation holds. This skill **finds problems**; it does not fix them and it does not write documents.

The code phase already works this way: `plan` writes, `plan-validate` judges, `implement` refuses to start on a dirty verdict. The doc phase had authoring and a human gate and nothing in between — so the person at the gate reads four pages looking for what is missing, which is the hardest thing for a reader to see. This stage turns *"read this and approve"* into *"resolve these three conflicts"*.

## Input
`/doc-validate <from> <to>` — the pair to check. Recognised pairs:

| From → To | Files | Coverage shape |
|---|---|---|
| `brief → prd` | `docs/requirements-brief.md` → `docs/prd.md` | 1:1 |
| `prd → hld` | `docs/prd.md` → `docs/hld.md` | 1:1 |
| `prd → features` | `docs/prd.md` → `docs/features.md` | 1:N |
| `hld → components` | `docs/hld.md` → `docs/components.md` | 1:1 |
| `features → fdd` | `docs/features.md` → `docs/fdd/*.md` | 1:N |
| `hld → fdd` | `docs/hld.md` → `docs/fdd/*.md` | 1:N |

With no argument, validate every pair whose two sides both exist.

If the target doesn't exist, abort: *"No `<to>` at `<path>`. Run `/<stage>` first."*

## The two coverage shapes
- **1:1 — does the content match?** Every element of the source appears in the target, transformed appropriately; every element of the target traces back.
- **1:N — is the set complete?** Every in-scope item of the source is owned by **at least one** member of the target set. This is the shape that hides the worst failure: a whole feature with no spec, invisible because each spec that does exist looks fine.

## Checks

| ID prefix | Category | The problem it catches |
|---|---|---|
| `CV-N` | Coverage (omission) | An element of the source that nothing in the target carries forward |
| `SC-N` | Set coverage | In a 1:N pair, a source item no member of the target set owns |
| `PC-N` | Partial credit | A source item the target marks as covered but only partly delivers — ticked where it should be listed as `partial` |
| `DG-N` | Dependency graph | A cycle in `docs/features.md`'s epic or feature graph, or a feature depending on one that no longer exists |
| `IV-N` | Invention | An element of the target that traces to nothing in the source |
| `RN-N` | Unanswered driver | An `RNF` in the PRD with no architectural response in the HLD |
| `IC-N` | Inconsistency | Two documents contradict — including two FDDs specifying conflicting contracts for a component they both list as touched |
| `GL-N` | Glossary drift | A term used with a meaning the glossary doesn't give, or a synonym introduced for a canonical term |
| `OL-N` | Overloading conflict | The two descriptions of a load-bearing term disagree with each other |
| `SR-N` | Serialization gap | The prose and the JSON contract carry different content |
| `MD-N` | Metadata | A `(required)` section empty, an unresolved `> Needs Input`, or `Status`/`Level` incoherent between source and target |
| `AS-N` | Unmarked assumption | A value in one of the `asking` skill's assumption classes (§6) that the source does not give, that carries no `> Assumed:` or `> Decided:` marker — and that would change the target if it were different |

`CV` is the direction that matters most and the one nothing else asks for. Documents are routinely checked for invention — "does everything trace back?" — and almost never for omission. Walk the **source** item by item and account for each in the target; anything unaccounted for is a `CV`, including items deliberately dropped whose reason was never written down.

`AS` is `IV`'s sibling, and the difference matters. An invention is an element the source never asked for; an unmarked assumption is a value the source **needed and did not give**, filled in as if it had. Both trace to nothing — but an invention should usually be removed, while an assumption usually has to stay and only needs to say what it is. A marked `> Assumed:` is not a finding: it is the writer doing its job, and it goes to the gate. An `Assumed` that survived an approved gate is `MD`. Fire `AS` only above the ceiling — if a different value would change nothing in the target, it is noise.

`OL` is detection, not correction: report that the two descriptions disagree and say how. Which one is wrong is a human decision, and it is the reason the pair goes to the user at all.

## Output
Write `docs/validation/<from>-to-<to>.md`:

```markdown
---
kind: doc-validation
pair: <from> → <to>
status: clean | dirty
open_issues: <count of open issues>
---

# Doc validation — <from> → <to>

## Findings
### <ID> — <one-line headline>
- **Where:** <source element and target location>
- **Why it blocks:** <one or two sentences>
- **Suggested resolution:** <the smallest change that would clear it>

## Resolved
<issues cleared on a re-run, moved here with their ID>
```

`status: clean` only when every finding is resolved. Otherwise `status: dirty`.

## Gate
- **dirty** → report exactly what to fix: *"`<path>` has N open issues. Fix the document (edit it or re-run `/<stage>`), then re-run `/doc-validate <from> <to>`."* **Never auto-fix**, and never partially proceed — a validator that edits the thing it judges has stopped being a second opinion.
- **clean** → *"`<from> → <to>` is clean. The gate is now: approve `<to>` and set `Status: approved`."*

The human gate reads this verdict first. A `dirty` verdict is not a veto over the user's judgement — they may approve anyway — but it means they are approving something with named, listed problems rather than approving in the dark.

## Who fixes
Whoever authored: the stage's agent, re-run, or the user editing directly. This skill never edits either document.
