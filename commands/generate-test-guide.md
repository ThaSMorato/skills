---
description: Analyze a project's stack and generate a project-specific testing-guide skill — what to test, at which layer, and how, per artifact type, including acceptance-test flows.
argument-hint: <project folder> (default: current directory)
---

Use the `generate-test-guide` skill for: $ARGUMENTS

Run all four phases — analyze the stack, research version-aware best practices, ask the user (layers, real/fake per external system, acceptance flows, conventions, coverage philosophy), then generate a multi-file `testing-guide-<project>` skill under `.claude/skills/`. The generic `testing` skill is the baseline it specializes.
