# Skill Anatomy

> How to write a Claude Code skill. A skill is a **model-invoked capability**: instructions that load into the **current** context when relevant. When to use skill × command × agent: see [`plugin-anatomy.md`](./plugin-anatomy.md#choosing-skill--command--agent-by-role).

## Format

```markdown
---
name: <kebab-case>             # = folder name
description: '<WHAT it does + WHEN to use / trigger phrases>'
disable-model-invocation: true # on every stage skill; never on a reference skill
user-invocable: false          # on every stage skill: out of the menu, reached through its `tm-` command
---

<imperative, short instructions, addressed to the model>
```

**The frontmatter is strict YAML, and `description` is the field that breaks it.** A good description names trigger phrases, so it tends to carry quotes and a `Triggers:` label, and an unquoted **colon followed by a space** reads as a nested mapping and aborts the parse. A value opening with `[` or `{` parses as a list or map rather than a string. Quote it; use single quotes when the trigger phrases use double ones.

This fails loudly in a strict parser and silently in a lenient one, so "it works here" is not evidence. A skill whose frontmatter does not parse simply **does not load**: the only signal is a startup warning, never an error where you try to use it.

`scripts/frontmatter.test.mjs` fails on an unquoted value that would break the parse.

Folder: `skills/<name>/SKILL.md`. List the path in `plugin.json → skills`; a skill that is on disk but not listed does not load, and `scripts/plugin-manifest.test.mjs` fails on it.

## Golden rules

1. **Write it by the writing standard.** How to word a description so it fires, where each piece sits, how a step ends, and the tests that find a sentence doing nothing are the `writing-for-agents` skill (`skills/writing-for-agents/SKILL.md`): the same standard the stages load when they write a guide or a `CLAUDE.md` line in a project. Read it before writing or editing a skill, and apply every section. The rest of this file is what is particular to this plugin.
   - **`description` is the trigger**, a pointer in that skill's terms. `architecture`, `clean-code`, `data-access` and `security` went from almost never firing to firing in most runs on the `evals/` suite once each description opened with the trigger and asked to be loaded on a familiar problem (Haiku still answers `security` alone); measure any change the same way.
   - **A stage skill's description is a one-line summary for the human.** The flag closes it to the model, so a trigger phrase in it can never fire; `scripts/skill-descriptions.test.mjs` fails on one.
   - **A reference skill has no exit.** `testing` and `clean-code` are read, not run; their completion bar is "every rule applied".
2. **One capability per skill.** If it does two things, it's two skills.
3. **Compose primitives.** Reuse other skills by reference instead of rewriting. Thin wrapper > monolith. (Owner rule: don't duplicate, reference.)
   - **Load a skill by naming the tool, with its full name**: "Call the Skill tool with `thasmorato-skills:domain-model`". A short name resolves to whatever answers to it first, a Claude Code built-in or another plugin's skill. A softer phrasing ("use the domain-model skill") lets the model read *about* the skill instead of loading it. The same holds for agents: "Call the Agent tool with `prd-writer`", so the work is delegated instead of done inline. An agent that calls the Skill tool lists `Skill` in its `tools`. `scripts/skill-invocation.test.mjs` fails on a soft phrasing, an unknown skill or agent name, or an agent missing the tool.
   - A mention that only points at a section ("the `tdd` skill's *Bugs: pin the bug, then flip it*") is a pointer, not a load, and stays as it is.
   - **Load on the branch that needs it.** A skill loaded at the top of a stage is paid for on every run; name the load at the step, or the case, that uses it.
4. **Look up facts, ask for decisions.** If the environment (fs, tools, memory) answers it, look it up; don't ask the user what you can discover.
5. **Typography.** Where a dash would go, text uses a comma, a colon, a semicolon, parentheses or a full stop, whichever says the relation meant. The one exception is the separator inside the three markers (`> Decided:`, `> Needs Input:`, `> Assumed:`), kept so documents in that format stay valid. In an unquoted frontmatter value, the colon is not available (it breaks the YAML); use a comma, a semicolon or parentheses there. `scripts/no-em-dash.test.mjs` fails on any other dash.

## Invocation: model or user

Two choices, trading the two loads of the `writing-for-agents` skill: the **context load** an always-loaded description costs the agent on every turn, and the **cognitive load** the human pays by being the index of which skills exist.

- **Model-invoked** (no `disable-model-invocation`): the description stays loaded so the agent, and other skills, can reach it. Pay this only when the agent must fire it on its own or another skill must load it. A **primitive** lives here: it concentrates a technique several skills reuse. A model-invoked skill that is all reference is also the home for reference several skills share.
- **User-invoked** (`disable-model-invocation: true`): zero context load; only the human typing its name reaches it, and no other skill can. The description becomes a one-line summary for the human, with no trigger list. A **wrapper**, the user's front door that composes primitives, lives here (e.g. `grill-with-docs` = `grilling` + `domain-modeling`).
- **A stage skill is closed, and its command reads it.** Every skill a command exists for (`ticket-plan`, `plan-validate`, `implement`...) carries the flag, so the model cannot start a stage on its own. The flag refuses every Skill tool call, a command's included (0.6.4), so the command does not call the skill: it reads the file, *"Read `${CLAUDE_PLUGIN_ROOT}/skills/<name>/SKILL.md` and follow it"*. A file read that way gets no `${CLAUDE_PLUGIN_ROOT}` substitution, so the skill opens with the line in `scripts/skill-kinds.mjs` (`STAGE_ROOT_NOTE`) that says where its paths start. A stage skill another stage needs (`implement` on `diagnose`) is read the same way.
- **A reference skill stays open.** The skills in `KNOWLEDGE_SKILLS` (`scripts/skill-kinds.mjs`: `testing`, `tdd`, `security`, `asking`...) carry no flag and are called through the Skill tool. A new skill is one or the other, and `scripts/skill-invocation.test.mjs` fails on a skill that is neither listed nor closed.
- Reference that two user-invoked skills both need can live in neither: neither can load the other. Put it in a plain file both point at.

## Testing a skill

A skill test passes for the wrong reason when something other than the skill told the model what to do. Two kinds of file do that, and both come out of the test's context.

- **The harness context.** The tester's own `CLAUDE.md`, memory, other installed plugins (another copy of this one included) and MCP servers sit in front of the model too. A global rule that says "load the testing skill" makes every trigger test pass.
- **Files that already hold the answer.** The model reads what it can reach. A test run inside the plugin's source can grep the skill's own text and copy the expected output; a fixture that states the result (a comment naming the bug, a file called `expected.md`) does the same.

**Does an open skill fire on its description?** That is a property of the description and of the model reading it, so it is measured per model, by `claude plugin eval`, which runs each case in an empty workspace with none of the harness context above and hides the suite from the agent. Every open skill has two cases under `evals/`: `<skill>-fires`, a request the description should catch, graded by a `tool_used` call to the Skill tool with its name, and `<skill>-near-miss`, a nearby request it should leave alone, graded by the same call with `min: 0` and `max: 0`. A near miss is what catches a description that fires on everything. A prompt never names the skill or the plugin. `node scripts/skill-evals.mjs plan` prints one command per model (local report, no baseline arm) for the owner to run; `node scripts/skill-evals.mjs summarize` turns the results into one table, case by model. One run per case is a smoke test; judge a description on the default three.

**Does a stage do its job?** That is a live test: `claude -p "/thasmorato-skills:<command>" --plugin-dir <this repo>` in a toy repo.
- Run it with `--setting-sources project,local`, which drops the user's `CLAUDE.md` and settings, and with `--strict-mcp-config`, which drops every MCP server not passed with `--mcp-config`. `--bare` drops more, but it authenticates only by API key.
- Build the toy repo in a temp folder, outside the plugin's source and with no `CLAUDE.md` in any folder above it.
- Plant the problems in code and docs the way a real repo has them, never in a fixture that names them, and grade the run on what it wrote and which tool calls it made (`--output-format stream-json --verbose`).

## Checklist
- [ ] Written by the `writing-for-agents` standard, every section applied: the description as a pointer, each piece on its tier, every step on a completion criterion, every sentence through the tests.
- [ ] Other skills are loaded with "Call the Skill tool with `thasmorato-skills:<name>`", on the branch that needs them.
- [ ] Invocation chosen on purpose: model-invoked only when the agent or another skill must reach it.
- [ ] One capability; reuses primitives instead of duplicating.
- [ ] Listed in `plugin.json`, and in `KNOWLEDGE_SKILLS` when it is a reference skill.
- [ ] An open skill has a `-fires` and a `-near-miss` case under `evals/`, and a live test ran without the harness context or a file holding the answer.

## Red flags
- A skill that does "X **and** Y" → split it.
- Content copied from another skill → reference it.
- A skill loaded at the top of a stage that only one branch uses → move the load to that branch.
