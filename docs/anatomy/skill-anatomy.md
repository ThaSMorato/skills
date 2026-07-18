# Skill Anatomy

> How to write a Claude Code skill. A skill is a **model-invoked capability**: instructions that load into the **current** context when relevant. When to use skill × command × agent: see [`plugin-anatomy.md`](./plugin-anatomy.md#choosing-skill--command--agent-by-role).

## Format

```markdown
---
name: <kebab-case>             # = folder name
description: <WHAT it does + WHEN to use / trigger phrases>
disable-model-invocation: true # optional: user-invoked only (wrapper), never auto-fires
---

<imperative, short instructions, addressed to the model>
```

Folder: `skills/<category>/<name>/SKILL.md`. List the path in `plugin.json → skills`.

## Golden rules

1. **`description` is the trigger.** It's how the model decides to invoke. State **what** and **when** ("Use when… / on triggers of…"). Vague = never fires or fires wrong.
2. **Short and imperative.** A good skill is a 5–10 sentence prompt, not a spec. Direct instruction ("Interview the user… Ask one question at a time…"), not explanatory prose.
3. **One capability per skill.** If it does two things, it's two skills.
4. **Compose primitives.** Reuse other skills by reference (`Use the /domain-model skill`) instead of rewriting. Thin wrapper > monolith. (Owner rule: don't duplicate — reference.)
5. **Progressive disclosure.** Keep `SKILL.md` lean; put detail (formats, examples) in sibling files loaded on demand (e.g. `FORMAT.md`).
6. **Look up facts, ask for decisions.** If the environment (fs, tools, memory) answers it, look it up; don't ask the user what you can discover.

## Wrapper × primitive
A **primitive** (auto-invocable) concentrates the technique and is reused by several skills. A **wrapper** (`disable-model-invocation: true`) is the user's front door that composes primitives. E.g. `grill-with-docs` = `grilling` + `domain-modeling`.

## Checklist
- [ ] `description` states what + when (triggers).
- [ ] Body imperative and short; one capability.
- [ ] Reuses primitives instead of duplicating.
- [ ] Heavy detail moved to a sibling file.
- [ ] No stray `- ` / empty sections.

## Red flags
- A skill that does "X **and** Y" → split it.
- Long explanatory body → it's a doc, not a skill; trim to the imperative.
- Content copied from another skill → reference it.
