---
description: 'Design a new screen or redesign an existing one before it is built: the brief in rounds, three directions as HTML with captures, the chosen one through every state and width with an isolated critic, then the screen spec in docs/ui/.'
argument-hint: "<screen: a name, or the ticket or feature it belongs to>"
---

Load skill `thasmorato-skills:ui-design` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: what the screen is for is written somewhere (a PRD, an FDD, a ticket, or the owner's request); with none, run the brief from the request and say so. For a redesign, an audit should exist (`.scratch/ui-audit/<screen>/audit.md`); without one, offer `/tm-ui-audit <screen>` first, and go on without it only on the owner's word.

Postflight: the path to `docs/ui/<screen>.md` and its captures, the chosen direction and why, the critic's verdict, the open decisions and every `> Assumed:`, and the next step: `/tm-tickets` or `/tm-design`.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
