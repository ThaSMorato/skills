# Skill Anatomy

> How to write a Claude Code skill. A skill is a **model-invoked capability**: instructions that load into the **current** context when relevant. When to use skill × command × agent: see [`plugin-anatomy.md`](./plugin-anatomy.md#choosing-skill--command--agent-by-role).

## Format

```markdown
---
name: <kebab-case>             # = folder name
description: '<WHAT it does + WHEN to use / trigger phrases>'
disable-model-invocation: true # optional: user-invoked only (wrapper), never auto-fires
---

<imperative, short instructions, addressed to the model>
```

**The frontmatter is strict YAML, and `description` is the field that breaks it.** A good description names trigger phrases, so it tends to carry quotes and a `Triggers:` label — and an unquoted **colon followed by a space** reads as a nested mapping and aborts the parse. A value opening with `[` or `{` parses as a list or map rather than a string. Quote it; use single quotes when the trigger phrases use double ones.

This fails loudly in a strict parser and silently in a lenient one, so "it works here" is not evidence. A skill whose frontmatter does not parse simply **does not load** — the only signal is a startup warning, never an error where you try to use it.

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
