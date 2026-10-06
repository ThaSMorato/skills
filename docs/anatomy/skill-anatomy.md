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

`scripts/frontmatter.test.mjs` fails on an unquoted value that would break the parse.

Folder: `skills/<name>/SKILL.md`. List the path in `plugin.json → skills` — a skill that is on disk but not listed does not load, and `scripts/plugin-manifest.test.mjs` fails on it.

## Golden rules

1. **`description` is the trigger.** It's how the model decides to invoke. State **what** and **when** ("Use when… / on triggers of…"). Vague = never fires or fires wrong.
   - **Don't summarize the workflow in it.** A description that lists the steps can be followed *instead of* the skill: the model acts on the summary and never reads the body. Say what it is for and when; leave the how to the body.
   - **Name the exclusion** when a sibling skill is the right one for a nearby request ("not for behavior changes — use `tdd`"). Two skills with overlapping triggers fire wrong half the time.
   - **One trigger per branch.** A branch is a distinct case the skill handles. Synonyms that rename one branch are that branch written twice: keep one. The description sits in context on every turn, so it earns harder pruning than the body.
2. **Short and imperative.** A good skill is a 5–10 sentence prompt, not a spec. Direct instruction ("Interview the user… Ask the open questions in rounds…"), not explanatory prose.
   - **No-ops go.** A sentence the model already obeys by default spends load to say nothing: delete the whole sentence, not words from it. Whether it is a no-op is settled by running the skill without it, not by debate. A word too weak to beat the default ("be thorough") is a no-op too; the fix is a stronger word ("relentless").
3. **One capability per skill.** If it does two things, it's two skills.
4. **Compose primitives.** Reuse other skills by reference instead of rewriting. Thin wrapper > monolith. (Owner rule: don't duplicate, reference.)
   - **Load a skill by naming the tool**: "Call the Skill tool with `domain-model`". A softer phrasing ("use the domain-model skill") lets the model read *about* the skill instead of loading it. The same holds for agents: "Call the Agent tool with `prd-writer`", so the work is delegated instead of done inline. An agent that calls the Skill tool lists `Skill` in its `tools`. `scripts/skill-invocation.test.mjs` fails on a soft phrasing, an unknown skill or agent name, or an agent missing the tool.
   - A mention that only points at a section ("the `tdd` skill's *Bugs: pin the bug, then flip it*") is a pointer, not a load, and stays as it is.
5. **Progressive disclosure.** Keep `SKILL.md` lean; put detail (formats, examples) in sibling files loaded on demand (e.g. `FORMAT.md`). Rough thresholds: reference material under ~50 lines stays inline; over ~100 lines it moves to a sibling file.
   - **Disclose by branch**: inline what every branch needs; move behind a pointer what only some branches reach.
   - **Co-locate**: a concept's definition, rules and caveats sit under one heading, not scattered across the file.
6. **Look up facts, ask for decisions.** If the environment (fs, tools, memory) answers it, look it up; don't ask the user what you can discover.
   - **The environment is the source of truth.** A skill that restates `package.json` scripts, a config file, the directory layout or `--help` output is a cache of a lookup, and it goes stale. Write down only what looking cannot find: the unwritten convention, the reason behind a choice, the gotcha no config confesses.
7. **Every step ends on a completion criterion.** A process skill says how you know each step, and the whole skill, is done, with evidence someone else could check: "run `npm test` and it is green", "the validation file says `status: clean`", not "verify the tests". A criterion is judged on two things:
   - **Clarity**: done and not-done can be told apart. A vague bound ("once you understand the module") lets the agent close the step early, pulled by the steps still ahead. Sharpen the bound first; split the sequence only when it cannot be sharpened and the rush is observed, and only across a real context boundary (a subagent or a hand-off).
   - **Demand**: how much it requires. "Every modified model accounted for" drives the legwork that "produce a change list" does not. The strongest criteria are both checkable and exhaustive.

   (Reference skills, such as `testing` and `clean-code`, have no exit; they are read, not run. Their bar is the same idea applied to flat reference: "every rule applied".)
8. **Write the positive.** State the behavior you want ("write one-line comments"), not the one you forbid. A prohibition puts the forbidden behavior in context and makes it more available, not less. Keep a prohibition only as a hard guardrail you cannot phrase positively, and pair it with the positive target.
9. **Leading words.** Prefer a compact word the model already knows (*tracer bullet*, *fog of war*, *tight* loop, a test that goes *red*) over a sentence that gestures at the idea. Repeat the word, never the sentence: it anchors the same behavior each time it appears, in fewer tokens. A coined word has to be defined, so reach for an existing one first.
10. **Typography.** Where a dash would go, new text uses a comma, a colon, a semicolon or parentheses.

## Invocation: model or user

Two choices, trading two costs. **Context load** is what always-loaded text costs the agent on every turn. **Cognitive load** is what the human pays by being the index of which skills exist.

- **Model-invoked** (no `disable-model-invocation`): the description stays loaded so the agent, and other skills, can reach it. Pay this only when the agent must fire it on its own or another skill must load it. A **primitive** lives here: it concentrates a technique several skills reuse. A model-invoked skill that is all reference is also the home for reference several skills share.
- **User-invoked** (`disable-model-invocation: true`): zero context load; only the human typing its name reaches it, and no other skill can. The description becomes a one-line summary for the human, with no trigger list. A **wrapper**, the user's front door that composes primitives, lives here (e.g. `grill-with-docs` = `grilling` + `domain-modeling`).
- Reference that two user-invoked skills both need can live in neither: neither can load the other. Put it in a plain file both point at.

## Checklist
- [ ] `description` states what + when (triggers), names the exclusion when a sibling fits better, and does not summarize the steps.
- [ ] Every step of a process skill ends on a completion criterion that is clear and exhaustive.
- [ ] Other skills are loaded with "Call the Skill tool with `<name>`".
- [ ] Written in the positive; prohibitions only as hard guardrails, paired with the target.
- [ ] Nothing restates what the environment already says.
- [ ] Invocation chosen on purpose: model-invoked only when the agent or another skill must reach it.
- [ ] Body imperative and short; one capability.
- [ ] Reuses primitives instead of duplicating.
- [ ] Heavy detail moved to a sibling file.
- [ ] No stray `- ` / empty sections.

## Red flags
- A skill that does "X **and** Y" → split it.
- Long explanatory body → it's a doc, not a skill; trim to the imperative.
- Content copied from another skill → reference it.
- "Don't X" with no "do Y" next to it → rewrite in the positive.
- A step that ends on "understand", "review" or "check" with nothing observable → sharpen the criterion.
- A list of commands or paths the repo already shows → delete it and let the agent look.
