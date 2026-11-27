---
name: asking
description: How to put a question, a finding, or a gate to the user; resolve every id to what it means, offer a structured choice when the answer is a closed set, and ask only what is genuinely a decision. Use whenever a stage reports findings, hits a gate, needs input, hands off to the next stage, or writes a Needs Input or Assumed marker.
---

The user is not holding your context. They have not just read the document you are quoting, they do not remember which finding `CV-3` was, and every second they spend reconstructing that is a second the stage cost them instead of saving.

## 1. Never make the reader dereference a pointer

**An id is an address, not a message.** `CV-3`, `RF-007`, ticket `04`, `ADR 0012`, `SI-2`, `EV-9`: alone, each of them forces the reader to go open a file and find the row. You already have it open. Resolve it for them.

| Don't | Do |
|---|---|
| "`CV-3` blocks the plan." | "**`CV-3`**: `AC-2` (*"an invoice is void 30 days after issue"*) is owned by no SI." |
| "Should we apply `ADR 0012`?" | "Should we apply **`ADR 0012`** (*value objects are immutable*) here?" |
| "Ticket `04` is blocked." | "Ticket **`04`: export the ledger to CSV** is blocked by `02: ledger read model`." |

Keep the id; it is how the thing is found and referenced later. Add the **shortest phrase that makes it recognisable**: the headline, the criterion's own words, the decision's subject. A quoted fragment of the original beats a paraphrase, because the reader will search for those words.

This applies everywhere an identifier is spoken: findings, gate reports, progress summaries, questions, and the `> Needs Input` markers an isolated agent writes: *"`> Needs Input: RF-004`"* tells nobody anything; *"`> Needs Input`: RF-004 (*"users can export their data"*) does not say which formats"* does.

**One exception:** a dense table whose columns already carry the meaning. There, the id is a key and the row is the resolution.

**Where it slips: turning findings into options.** A validator's finding (`DG-3`, `CV-2`) or an AC id that becomes a question's option or header carries its words inside the option, because the option list is all the owner sees. Before sending a question, read it as the owner will: every id quoted, nothing that needs a file opened.

**Show the thing, not where it is.** A question about copy carries the text; about a screen or a screenshot, the absolute path the owner can open (and say where it was saved). A question about a consequence ("how should these tests keep proving the price?") first states the change that causes it: where, which screens, what the user sees. Ask the product question before the mechanics question that depends on it.

**Open the round with what it is about.** Every round of questions starts by naming the feature and the ticket (*"ledger export, ticket `02: CSV writer`"*): the owner may have more than one session open, and an option list with no subject gets answered for the wrong one. A node of the map, a stage artifact or a file the question cites gets the same one-phrase resolution an id does.

## 2. Offer a choice when the answer is a closed set

When you know the options, present them as **options** rather than asking an open question and making the user compose the answer in prose.

- **Lead with your recommendation** and say it is one.
- **Label by outcome, not by mechanism**: "keep the existing component and write only the link service" rather than "option B".
- **Say what each choice costs.** An option list without consequences is a menu without prices.
- **The recommendation never widens the request.** An option that builds more than was asked (a second format, a refactor next door, a ticket nobody requested) can be offered, never recommended. The **minimal variant**, the least that answers the request, is always one of the options.
- **One option per independent choice.** Two decisions that do not depend on each other are two questions, not four options that combine them.
- **Each option says what it creates and where** (the file, the ticket, the section it adds or edits) **and what deferring it costs**: what gets harder later, or nothing.
- **Offer the moves that unblock, when they fit:** *amend the contract upstream* (the FDD, the ticket, the plan) when the obstacle is a decision written above this stage, and *start now, the dependent part last* when only part of the work waits on something.
- **Multi-select when the options combine.** Merges, splits, a set of findings to fix: when the owner may pick several, let them, instead of making them type "2 and 3" into Other.
- **Free text is right** when the answer is genuinely open: a name, a business rule, a constraint you cannot enumerate. Don't force a real question into fake options.

**When the answer is a question, answer it.** An "Other" that asks something ("what does AC-9 say?") is the owner's turn, not a reply to fold in: answer it in plain words, and stop. An "Other" that objects to the options (*"none of these, the real problem is…"*) is answered the same way: in text, about the objection, before any option comes back. Re-ask only after they have read the answer; editing files or rewording the question in the meantime answers nothing.

**Group, don't flood.** Twelve findings do not become twelve prompts. Ask about the ones where you genuinely cannot proceed, and report the rest for the user to read.

**Ask in rounds.** When several questions are open, the **frontier** is every one whose prerequisites are already settled: the questions you can ask now without guessing at an answer you have not heard. Ask the whole frontier in one round, numbered, each with your recommendation; a question whose answer depends on another one in the same round waits for the next round, and so does one that depends on evidence the owner has not seen yet (a prototype, a screenshot, a sample): show it first, then ask. The answers move the frontier; recompute it and ask again. With a structured-choice tool, one call carries as many as the tool allows, the most load-bearing first.

## 3. Ask only what is a decision

Look it up before you ask. The code, the docs, `CONTEXT.md`, the config, the tool output: anything you can discover is a **fact**, and facts are yours to find. Only **decisions** go to the user: trade-offs, preferences, priorities, things the environment genuinely does not record.

A question whose answer is in a file you could have read is a question that teaches the user their attention is cheap to you.

**Check the premises before the question.** A question rests on facts ("the URL would exceed the limit", "there is no external API", "the list was not provided"). Before sending it, name each one and verify the cheap ones: measure it, search the repo and this session's `.scratch/` for what was already captured, look for the flag, the enum, the history, before claiming something is absent, and pull a real sample from the integration when one is reachable. The cheap ones come first: the **literal value** (the string, the number, the config key as the file has it, not as remembered), the integration's **raw response**, the **remote state** (`git fetch`, then whether a blocker's pull request merged), the **worktree and branch** of the current directory, and a **size measured** rather than estimated. For a ticket, `node "references/scripts/blocker-state.mjs" <ticket file>` answers the remote state and the worktree at once (§7, `handoff.md`). The question says where it looked (*"checked `gh pr list` and ticket 01's progress file"*). Each option says what it rests on: *"the task says X"*, *"inferred from Y"*. A question built on an absence ("I found no Z") offers **investigate further** as one of its options. Something the owner already answered or supplied is a fact: never ask it again.

## Every stage ends on `/new`, then the next command
A stage reads its input from disk, so the conversation that produced it is dead weight to the next one, re-sent on every call it makes. The closing line names `/new` first: *"you run: `/new`, then `$thasmorato-skills:tm-plan-validate 03-checkout`"*. The one exception is this same stage continuing (the next SI of `$thasmorato-skills:tm-implement`), which keeps its context and names `/compact`.

What only this conversation holds does not survive `/new`: a preference or a correction the owner gave in chat, a decision no artifact records yet. Write it into the artifact that owns it before closing; when it has no artifact, the closing line names `$thasmorato-skills:tm-handoff` first: *"you run: `$thasmorato-skills:tm-handoff`, then `/new`, then `$thasmorato-skills:tm-implement 03-checkout`"*.

## The rest, by what you are doing
Sections 4 to 7 live beside this file. Read the one your next move needs:

| When you are | Read | It holds |
|---|---|---|
| writing a `> Needs Input`, `> Assumed` or `> Decided` marker, or judging whether a value is an assumption | [`markers.md`](markers.md) | §4 the three markers and their callouts; §6 the classes of assumption, and the ceiling |
| putting a gate to the owner: the approval of what a stage produced | [`gates.md`](gates.md) | §5 the brief, what the approval covers, the assumptions at the gate |
| ending a stage: naming what comes next, a ticket's criteria or its blockers | [`handoff.md`](handoff.md) | §7 the stop report, open prerequisites, blocker states |
