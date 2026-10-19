---
description: Write the questions the owner cannot answer alone into a questionnaire for the person who can, or fold a filled questionnaire's answers back into the documents waiting on them.
argument-hint: "<who it goes to and about what>, or <path to a filled questionnaire>"
---

Load skill `thasmorato-skills:questionnaire` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: an argument that is a path to a `kind: questionnaire` file with answers runs **read-back**; anything else runs **write**. For write, there is at least one decision to send: an open question, a `> Needs Input:` marker, or one the owner names.

Postflight:
- **Write:** the file's path, the recipient, how many questions, and which documents are waiting on them. Sending it is the owner's step.
- **Read-back:** each answer and the `Decided` marker it became, the documents whose text has to change through their own stage, and what is still open.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
