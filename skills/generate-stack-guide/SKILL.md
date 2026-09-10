---
name: generate-stack-guide
description: Generate a per-technology engineering guide skill — conventions, patterns and gotchas for one language or framework, as a router with lazy-loaded rules. Use on "generate a stack guide / guide for <tech>", or when the guidelines router marks a technology as missing. User-invoked.
disable-model-invocation: true
---

Produce a **concrete, per-technology guide** at `.claude/skills/<tech>-guide/`. The generic standard lives in the `clean-code`, `code-smells` and `architecture` skills; this generator specializes it to one language or framework.

**Input:** `$ARGUMENTS` = the technology (`ruby`, `react`, `nestjs`, `go`…). If none is given, list what the repo uses and ask.

The unit is **the technology, not the project** — a Ruby guide serves every Ruby project, and a Ruby + React repo composes two guides rather than needing one impossible combined document. This is also what keeps the guide reusable across the user's repos.

## Phase 1 — Choose the source
Ask where the good practices should come from. The generator is only as good as its source, so this is the question that decides the output's quality:

1. **A folder of notes** (markdown, a wiki, a personal knowledge base) — the best case: opinionated, already curated, already the user's actual standard.
2. **The existing repo** — mine the conventions in use. Best for brownfield, where the guide's job is to describe what the team already does rather than to import someone else's taste.
3. **Authoritative public sources** — official docs and well-known style guides, fetched now.
4. **A mix**, in a stated precedence order.

Be honest about the limits: options 1 and 2 are the ones this generator does well. If the user has no clean source, say that the guide will be thin and worth seeding by hand, rather than producing something confident and generic.

## Phase 2 — Mine
Extract from the chosen source, filtered to the **versions this repo actually uses** (read the manifests first — advice for a newer major is worse than no advice):
- **Conventions:** naming, file and module layout, typing, signatures.
- **Idioms:** the way this ecosystem does the common things, and the way it should not.
- **Error handling and concurrency** as the language expresses them.
- **Framework specifics:** lifecycle, dependency injection, configuration, the escape hatches and when they are legitimate.
- **Gotchas:** the things that are correct-looking and wrong here.
- **Security idioms:** the safe way to do the dangerous things in this stack — the `security` skill's catalog is generic on purpose, and the safe idiom is not.
- **Component boundaries:** what an independently releasable unit *is* in this ecosystem (a gem, a workspace package, a module, a crate) — the `architecture` skill cannot know this.

Where the repo and the external source disagree, the **repo wins** and the divergence is noted; a guide that contradicts the code it governs will be ignored.

## Phase 3 — Confirm
Show what you found — the conventions, and anything where the repo and the source disagree — and confirm the calls before writing. This is the only interactive step; get it right here rather than generating twice.

## Phase 4 — Generate
Write a multi-file skill at `.claude/skills/<tech>-guide/`:

```
<tech>-guide/
├── SKILL.md          (~100-150 lines: what this stack is, the non-negotiables,
│                      a quick-reference table, and the routing index below)
├── rules/            (one file per convention area: naming, structure, errors,
│                      async, testing idioms, security idioms — each ~30-60 lines)
└── references/       (external links with what each one answers; version notes)
```

Rules for the generated guide:
- **Router shape, like `code-smells`.** `SKILL.md` is a table of what to load when; a rule file is read only when its row matches. The whole point is that a stage pays for the rule it needs.
- **Trigger phrases are technology-scoped** (`"<tech> conventions"`, `"writing <tech>"`) so guides compose instead of colliding.
- **Reference sub-files with backticks** (`` `rules/errors.md` ``), never markdown links — links risk eager-loading and break lazy disclosure. Sub-files carry no frontmatter and a one-line back-reference to `SKILL.md`.
- **Self-contained.** The generated guide references nothing outside itself and the project. Whatever it took from an external source is **copied in**, not linked as a dependency — the source lives on the machine where generation happened, and the guide has to work without it.
- **Concrete.** Every rule shows the ecosystem's real syntax and names. A rule that would be true of any language belongs in `clean-code`, not here.
- **Reference only** — no workflow or orchestration sections. The process stays in the plugin's stages; this plugs into them.

## Phase 5 — Register
Add or update the technology's row in `docs/guidelines.md`'s routing table, with the file patterns that should load this guide. A guide nothing routes to will not be found.

## Constraints
- Only write inside `.claude/skills/<tech>-guide/` and the routing row in `docs/guidelines.md`.
- Don't modify other skills or rules.
- If the technology isn't actually used in this repo, say so and confirm before generating.
