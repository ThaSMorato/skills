# Command Anatomy

> How to write a slash command. A command is a **user entrypoint**: a prompt fired by `/name`, run in the **main context**. When to use command × skill × agent: see [`plugin-anatomy.md`](./plugin-anatomy.md#choosing-skill--command--agent-by-role).

## What lives in `commands/`

**User entrypoints** — thin by design: a command orchestrates, delegates heavy generation to agents, composes skills, and makes sure the inputs are on disk before handing off to an isolated context.

Each stage command carries a **preflight** (does the input exist? if not, name the command that produces it) and a **postflight** (what came out, what needs attention, what to run next). That pair is what makes stages composable outside `/flow`.

`/flow` is the coordinator. It reads state from the artifacts on disk rather than from a status file, so every other command runs standalone and none of them owes `/flow` an update.

**Every `.md` in this directory becomes a command.** There is no ignore convention, so a stray file ships as a real `/name` entry — and under a host that treats commands as description-matched skills, it competes for auto-invocation with a description that describes nothing. Prose about the directory belongs here in `docs/`, not beside the commands.

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
2. **Deterministic entry.** It's an explicit user trigger — name it after the action (`/prd`, `/interview`). Use `argument-hint` to make the input clear.
3. **Runs in main → can be interactive.** Unlike an agent, a command sees the conversation and talks to the user. Good for HITL flows that also need a named trigger.
4. **Composes skills.** A command can "run skill X" (e.g. `/interview` runs `interview` + `domain-model`) — reuse instead of rewriting the logic.
5. **Handoff via files.** If it delegates to an agent (isolated context), the command ensures the **inputs are on disk** (brief, template) and points the agent at them.
6. **Preflight and postflight.** On the way in, check the inputs exist — and when one is missing, name the command that produces it, so the failure teaches the user the chain. On the way out, summarize what was produced, what needs their attention, and what to run next. That pair is what makes a stage usable on its own, outside `/flow`.

## Checklist
- [ ] `description` clear (shows in the command menu).
- [ ] `argument-hint` if it takes an argument.
- [ ] Thin: delegates heavy generation to agents.
- [ ] Reuses existing skills.
- [ ] Preflight names the command that produces a missing input; postflight names the next step.
- [ ] `allowed-tools` restricted to what's needed (if applicable).

## Red flags
- A command that implements all the logic inline → extract to a skill/agent.
- Heavy/parallelizable work running in main → move it to an agent.
