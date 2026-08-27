---
name: clean-code
description: The positive standard for writing and refactoring code — naming, functions, comments, errors, and design. The "how to write it well" companion to the code-smells "what to flag". Use in the refactor step of implementing, and as the Standards lens when reviewing.
---

The standard a change is held to when the repo's own `docs/guidelines.md` is silent. These are principles, not rules to enforce mechanically — the repo's documented guidelines override, and anything the tooling (linter/formatter) already enforces is not worth a comment. For the *negative* tells that flag a violation, use the `code-smells` skill; this skill is the *positive* target.

## Naming
- A name reveals intent — if it needs a comment to explain it, rename it.
- One word per concept; a class is a noun, a method is a verb; drop noise words (`data`, `info`, `manager`).
- Names are pronounceable and searchable; no cryptic abbreviations, no encodings.

## Functions
- Small; do **one thing** at a single level of abstraction (the Stepdown Rule: each function is followed by those one level below it).
- Few arguments (aim ≤3); no boolean flag parameter — split it into two functions.
- **Command–Query Separation:** a function either *does* something or *answers* something, never both.
- No hidden side effects — the name tells the whole story.

## Comments
- Prefer code that explains itself over a comment explaining bad code.
- Comment the **why**, never the **what**. Delete commented-out code — version control remembers it.

## Errors
- Use exceptions, not error codes; put context in the message.
- Never swallow an error; fail fast. Don't return or accept `null` — use an empty collection, an optional, or a special-case object.

## Design
- **Single Responsibility:** one reason to change per module; keep them small and cohesive.
- Depend on abstractions, not concretions. Tell, don't ask. Avoid train wrecks (`a.b().c().d()`).
- **DRY** — remove duplication — but don't abstract for imagined needs (YAGNI; no speculative generality).
- Deep modules: a lot of behavior behind a small interface.

## Always
- **Boy Scout Rule:** leave the code cleaner than you found it.
- Code — and its tests — should read like well-written prose.
