---
description: 'Evaluate an existing screen in the running software and list its problems with evidence and severity: an isolated design critique, a technical pass and a worst-case data run. Reports; never edits.'
argument-hint: "<screen: a route, URL or name>"
---

Call the Skill tool with `ui-audit` for: $ARGUMENTS

> Call the Skill tool with `asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the screen is named and can run (a route or URL the dev server serves). With no running server and no way to start one, stop and say so: an audit from the code alone is a guess about what the user sees.

Postflight: the path to `audit.md` and the HTML report (opened), the heuristics score, the counts by severity, the P0 and P1 findings resolved to their words, the strengths, what was not covered, and the next step: `/ui-design <screen>` or a ticket per fix.
