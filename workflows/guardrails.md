---
description: 'Install the checks a repository is missing, using the commands it already has: pre-commit hook, CI job, a Claude Code hook that blocks destructive git, and optionally a dependency linter for docs/arquitetura/boundaries.md. Each one is proven to fire.'
argument-hint: "[what to set up: pre-commit, ci, git-guard, deps; empty for all]"
---

Load skill `thasmorato-skills:guardrails` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: this is a git repository with at least one check command (lint, type check or test) that can be found. With none, say so: there is nothing to wire in, and the stack guide (`/tm-generate-stack-guide`) or the owner has to name the commands first.

Postflight: the inventory table, what was installed and where, how each item was proven to fire, anything left non-blocking and why, and that a new Claude Code session is needed for the git guard to load.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
