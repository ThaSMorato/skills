---
name: tm-generate-test-guide
description: "Analyze a project's stack and generate a project-specific testing-guide skill (what to test, at which layer, and how, per artifact type, including acceptance-test flows)."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <project folder> (default: current directory)


Read the `generate-test-guide` skill (`references/skills/generate-test-guide/index.md`) for: the text after the skill name

Run all four phases: analyze the stack, research version-aware best practices, ask the user (layers, real/fake per external system, acceptance flows, conventions, coverage philosophy), then generate a multi-file `testing-guide-<project>` skill under `.claude/skills/`. The generic `testing` skill is the baseline it specializes.
