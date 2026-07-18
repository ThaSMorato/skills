# Agent Anatomy

> How to write a subagent. An agent runs in an **isolated context**, is invoked by the main agent (delegation), is **parallelizable**, and **returns an artifact** — it does **not** talk live to the user. When to use agent × skill × command: see [`plugin-anatomy.md`](./plugin-anatomy.md#choosing-skill--command--agent-by-role).

## Format

```markdown
---
name: <kebab-case>
description: <WHEN to delegate to this agent — the main agent uses this to decide>
tools: Read, Grep, Glob, Write        # allowlist; omit to inherit all
model: sonnet                          # optional
---

<the agent's system prompt — see the blocks below>
```

File: `agents/<name>.md`. Auto-discovered.

## The system prompt (blocks)
Inherited from the agent-prompt anatomy (persona → workflow). Not all are mandatory, but **Inputs** and **Output** are non-negotiable for an isolated agent.

1. **Persona & scope** — who it is and what is (and isn't) in its mandate.
2. **Objective** — the single thing it delivers.
3. **Inputs** — **what it receives and from where** (files, args). Since the context is isolated, it **can't see the conversation**: everything it needs arrives via file/parameter. List paths and what to read in each.
4. **Output format** — the **exact artifact** it returns (a file at a given path, or structured text/JSON). The return is data for a machine, not a message for a human.
5. **Quality criteria** — what "good" means (e.g. filled every required section of the template, cited the source).
6. **Ambiguity & assumptions** — how to act without being able to ask: assume the reasonable default and **mark it** (`Needs Input`) instead of stalling.
7. **Negative instructions** — what **not** to do (don't invent elements outside the input, don't exceed scope).
8. **Error handling** — what to do when an input is missing or invalid.
9. **Workflow** — the order of steps (read input → produce → self-review → write).

## Golden rules

1. **Self-sufficiency.** Isolated context = can't ask and can't see the conversation. If information is missing, it's either in the input or the agent **assumes-and-marks**. Design the handoff: the caller provides the files.
2. **One objective.** One agent, one deliverable. Multiple objectives → multiple agents (which the coordinator parallelizes).
3. **Fills a template, doesn't invent structure.** Point the agent at the skeleton in `templates/`; it fills the sections, prunes the optional ones, and renumbers.
4. **Minimal `tools`.** Grant only what's needed (a doc generator rarely needs `Bash`).
5. **Self-review in the workflow.** Last step: reread the output against the criteria/template before writing.

## Checklist
- [ ] `description` states **when to delegate**.
- [ ] Inputs list paths and what to read (isolated!).
- [ ] Output = exact artifact at a defined path.
- [ ] Ambiguity → assume-and-mark (`Needs Input`), don't stall.
- [ ] `tools` restricted; self-review at the end.

## Red flags
- An agent that "asks the user" → impossible when isolated; reposition it as a skill.
- Vague output ("I'll explain what I did") → define the artifact.
- Depends on the earlier conversation → pass it via a file.
