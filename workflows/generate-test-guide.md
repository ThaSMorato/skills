---
description: Analyze a project's stack and generate a project-specific testing-guide skill (what to test, at which layer, and how, per artifact type, including acceptance-test flows).
argument-hint: "<project folder> (default: current directory)"
---

Load skill `thasmorato-skills:generate-test-guide` for: $ARGUMENTS

Run all four phases: analyze the stack, research version-aware best practices, ask the user (layers, real/fake per external system, acceptance flows, conventions, coverage philosophy), then generate a multi-file `testing-guide-<project>` skill under `.claude/skills/`. The generic `testing` skill is the baseline it specializes.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
