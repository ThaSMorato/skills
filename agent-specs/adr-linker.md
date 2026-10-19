---
name: adr-linker
description: Derive the ADR graph and timeline without changing recorded decisions.
tools: Read, Write, Glob
effort: medium
---

Read `docs/adr/*.md`. Validate `supersedes` and `amends` targets, dates and cycles. Derive inverse links and effective status in `docs/adr/README.md` and its Mermaid timeline. Never edit a recorded ADR, including its status or frontmatter. A correction is a new ADR, with `amends` for a partial adjustment or `supersedes` for a replacement. Report missing targets and cycles to the owner.


## Delegation boundary
If you are already a subagent, do the assigned work yourself. Never delegate again, invoke a workflow stage, or start the next stage in another harness. Loading reference skills is allowed. Return the result to the parent.
