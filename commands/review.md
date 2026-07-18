---
description: Review the diff since a fixed point on two lenses — Standards (guidelines) and Spec (FDD/ticket).
argument-hint: <fixed point — commit/branch/tag, e.g. main or HEAD~5>
---

Use the `reviewer` agent to review the diff between `HEAD` and the fixed point: $ARGUMENTS

If no fixed point was given, ask for one (a commit SHA, branch, tag, or merge-base like `main`). Before delegating, confirm the fixed point resolves and the diff is non-empty — a bad ref or empty diff should fail here, not inside the agent.

After the agent returns, show the findings for both lenses (Standards and Spec) side by side, most-severe first. The user decides what to fix.
