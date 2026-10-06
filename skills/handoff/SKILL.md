---
name: handoff
description: 'Write what only this conversation knows into a handoff file, so a fresh session can continue the work without re-asking: the direction, the decisions said only in chat, what is in flight, and the next step, pointing at the artifacts for everything else. Use before ending a long session, on "handoff / continue in a new session / pass this to another agent".'
disable-model-invocation: true
argument-hint: "[what the next session will do]"
---

A new session starts with the files and nothing else. The flow's artifacts already carry most of the state: `/flow` derives where each feature stands from them, and `/implement` resumes from `progress.md`. What they do not carry is what was said only here. That is what a handoff is for, and all it is for.

## What goes in
- **The goal of the next session**: the argument, when one was given, or the obvious next step.
- **Where things stand, by pointer**: the feature or ticket, its stage, the paths to its artifacts (brief, FDD, node map, plan, `progress.md`, review, diagnosis), the branch and the last commit. Point; do not copy what they say.
- **What only the conversation knows**, which is the reason this file exists:
  - decisions the owner made in chat that no artifact records yet (and which artifact should record them);
  - preferences and corrections the owner gave ("don't touch the legacy importer", "tests in the e2e folder");
  - what is in flight: the hypothesis being tested, the half-made change, the command that was about to run;
  - what was tried and failed, so it is not tried again;
  - open questions waiting on the owner.
- **Suggested skills**: which skills the next session should call the Skill tool with first, and why.
- **The first command** to run in the new session.

Leave out the narrative of how the session went, and anything an artifact or `git log` already says.

## Write it
Redact first: tokens, passwords, keys, personal data become `<REDACTED>`; the file may be pasted into another tool.

Save it to the system temp directory, resolved the same way every run: `$TMPDIR`, else `/tmp` (`%TEMP%` on Windows), as `<tmpdir>/handoff-<project>-<YYYYMMDD-HHMM>.md`. It is a bridge between two sessions, not a project document, so it stays out of the repository. **Print the path**, and the line to start the next session with: *"Read `<path>` and continue."*

A decision that belongs in an artifact should go there, not only into the handoff: offer to write it to its artifact now (a `> Decided:` marker, a progress note), so the handoff can point at it.

**Done when** every decision and preference said only in chat is either in an artifact or in the handoff, and the file's path is printed.
