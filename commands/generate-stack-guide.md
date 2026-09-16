---
description: Generate a per-technology engineering guide skill — conventions, idioms, gotchas and security idioms for one language or framework, as a lazy-loaded router.
argument-hint: "<technology> — e.g. ruby, react, nestjs, go"
---

Use the `generate-stack-guide` skill for: $ARGUMENTS

Run all five phases — choose the source, mine it, confirm the calls with the user, generate `.claude/skills/<tech>-guide/`, and register the routing row in `docs/guidelines.md`.

The unit is the **technology**, not the project: a Ruby + React repo gets two guides that compose, and each one is reusable in the next repo that uses that stack.

After it returns, show what was generated, which conventions came from the repo versus the external source, and any place the two disagreed.
