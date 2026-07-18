---
description: Investigate a technical question against primary sources, producing a cited report that feeds the HLD/FDD.
argument-hint: <the research question>
---

Use the `researcher` agent — run it in the background so you can keep working while it reads — to investigate: $ARGUMENTS

It writes the cited findings to `docs/research/<slug>.md`.

After it returns, show a short summary: the key findings (with their sources), the implications for the design, and any open questions. This report is an input to `/hld` and `/fdd`.
