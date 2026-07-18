# Command Anatomy

> How to write a slash command. A command is a **user entrypoint**: a prompt fired by `/name`, run in the **main context**. When to use command × skill × agent: see [`plugin-anatomy.md`](./plugin-anatomy.md#choosing-skill--command--agent-by-role).

## Format

```markdown
---
description: <what the command does — shown in the /command list>
argument-hint: <e.g. [feature] or "<path to FDD>">   # optional
allowed-tools: Read, Edit, Bash(git*)                 # optional (restricts)
model: sonnet                                         # optional
---

<the prompt; use $ARGUMENTS, $1, $2 for the user's arguments>
```

File: `commands/<name>.md`. Auto-discovered (no need to list it in `plugin.json`).

## Golden rules

1. **Thin.** A command is an entrypoint, not the implementation. It orchestrates and **delegates the heavy work to agents** (isolated context, parallelizable). E.g. `/adr-generate` fires the `adr-generator` agent.
2. **Deterministic entry.** It's an explicit user trigger — name it after the action (`/prd`, `/entrevista`). Use `argument-hint` to make the input clear.
3. **Runs in main → can be interactive.** Unlike an agent, a command sees the conversation and talks to the user. Good for HITL flows that also need a named trigger.
4. **Composes skills.** A command can "run skill X" (e.g. `/entrevista` runs `interview` + `domain-model`) — reuse instead of rewriting the logic.
5. **Handoff via files.** If it delegates to an agent (isolated context), the command ensures the **inputs are on disk** (brief, template) and points the agent at them.

## Checklist
- [ ] `description` clear (shows in the command menu).
- [ ] `argument-hint` if it takes an argument.
- [ ] Thin: delegates heavy generation to agents.
- [ ] Reuses existing skills.
- [ ] `allowed-tools` restricted to what's needed (if applicable).

## Red flags
- A command that implements all the logic inline → extract to a skill/agent.
- Heavy/parallelizable work running in main → move it to an agent.
