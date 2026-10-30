---
description: 'Write a ticket''s pull request body from what the work left on disk: a summary drawn as the smallest view, before-and-after evidence, and the merge danger (one-way or two-way door, blast radius).'
argument-hint: "<ticket slug> <fixed point, the one /tm-review used>"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/pr/SKILL.md` and follow it for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed`, and a review file exists for it. A PR body written before the review cannot say what the review found; point at `/tm-review` and stop. If `/tm-tidy` has not run, say so and go on: it is optional. Then the skill's own Preflight: blockers and branch, signing, host and tracker auth, the tracker id, acceptance after the last change, a change after the review, a visible change in the Direct gear, files the branch did not touch, the repo's obligations.

Postflight: the path to `prs/<NN>-<slug>.md`, the door and the blast radius in one line, anything listed as not verified, and the skill's Postflight (sibling placeholders, tracker fields, the remaining tickets and what each one waits on). Then ask whether to open the pull request, as a structured choice; open it only on a yes.
