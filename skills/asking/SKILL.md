---
name: asking
description: How to put a question, a finding, or a gate to the user — resolve every id to what it means, offer a structured choice when the answer is a closed set, and ask only what is genuinely a decision. Use whenever a stage reports findings, hits a gate, needs input, or writes a Needs Input marker.
---

The user is not holding your context. They have not just read the document you are quoting, they do not remember which finding `CV-3` was, and every second they spend reconstructing that is a second the stage cost them instead of saving.

## 1. Never make the reader dereference a pointer

**An id is an address, not a message.** `CV-3`, `RF-007`, ticket `04`, `ADR 0012`, `SI-2`, `EV-9` — alone, each of them forces the reader to go open a file and find the row. You already have it open. Resolve it for them.

| Don't | Do |
|---|---|
| "`CV-3` blocks the plan." | "**`CV-3`** — `AC-2` (*"an invoice is void 30 days after issue"*) is owned by no SI." |
| "Should we apply `ADR 0012`?" | "Should we apply **`ADR 0012`** (*value objects are immutable*) here?" |
| "Ticket `04` is blocked." | "Ticket **`04` — export the ledger to CSV** is blocked by `02 — ledger read model`." |

Keep the id — it is how the thing is found and referenced later. Add the **shortest phrase that makes it recognisable**: the headline, the criterion's own words, the decision's subject. A quoted fragment of the original beats a paraphrase, because the reader will search for those words.

This applies everywhere an identifier is spoken: findings, gate reports, progress summaries, questions, and the `> Needs Input` markers an isolated agent writes — *"`> Needs Input: RF-004`"* tells nobody anything; *"`> Needs Input`: RF-004 (*"users can export their data"*) does not say which formats"* does.

**One exception:** a dense table whose columns already carry the meaning. There, the id is a key and the row is the resolution.

## 2. Offer a choice when the answer is a closed set

When you know the options, present them as **options** rather than asking an open question and making the user compose the answer in prose.

- **Lead with your recommendation** and say it is one.
- **Label by outcome, not by mechanism** — "keep the existing component and write only the link service" rather than "option B".
- **Say what each choice costs.** An option list without consequences is a menu without prices.
- **Free text is right** when the answer is genuinely open — a name, a business rule, a constraint you cannot enumerate. Don't force a real question into fake options.

**Group, don't flood.** Twelve findings do not become twelve prompts. Ask about the ones where you genuinely cannot proceed, and report the rest for the user to read. When several questions are independent and each has a small set of answers, one grouped set beats a serial interrogation; when the answer to one changes what the next question even is, ask them one at a time.

## 3. Ask only what is a decision

Look it up before you ask. The code, the docs, `CONTEXT.md`, the config, the tool output — anything you can discover is a **fact**, and facts are yours to find. Only **decisions** go to the user: trade-offs, preferences, priorities, things the environment genuinely does not record.

A question whose answer is in a file you could have read is a question that teaches the user their attention is cheap to you.

## 4. Make the default visible

When you are proceeding under an assumption rather than blocking, say what you assumed **and what would change if it were wrong**. "Assuming the ledger is append-only — if it isn't, `SI-3` needs a different seam" lets the user correct you in one word. An unstated assumption gets discovered three stages later, which is where this whole suite's expensive mistakes live.

## 5. For a gate, say what is being decided

A gate is not "approve?". It is: what was produced, what needs attention **with each item resolved**, what happens next if approved, and what to say instead if not. The user should be able to answer without opening anything — and should be able to open everything, because you named the paths.
