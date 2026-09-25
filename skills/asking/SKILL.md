---
name: asking
description: How to put a question, a finding, or a gate to the user — resolve every id to what it means, offer a structured choice when the answer is a closed set, and ask only what is genuinely a decision. Use whenever a stage reports findings, hits a gate, needs input, or writes a Needs Input or Assumed marker.
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

## 4. Make the default visible — as a marker, not a sentence

When you are proceeding under an assumption rather than blocking, say what you assumed **and what would change if it were wrong**. "Assuming the ledger is append-only — if it isn't, `SI-3` needs a different seam" lets the user correct you in one word. An unstated assumption gets discovered three stages later, which is where this whole suite's expensive mistakes live.

In a document, that sentence is a **marker**, because a marker is something a validator can find and a sentence is not. There are three, and each carries the value, where it came from, and what breaks if it is wrong:

| Marker | Means | At the gate |
|---|---|---|
| `> Needs Input: <what> — <why no default is defensible>` | there is no value you can defend; what is written is a placeholder | **blocks** — the document is not approvable until it is answered |
| `> Assumed: <value> — <no source: what you looked at>. If <other value>, <what changes>.` | you chose a value the sources do not give, and you can defend it | **listed** — the user confirms or corrects, but it does not block |
| `> Decided: <value> — <who>, <YYYY-MM-DD>` | an `Assumed` the user confirmed or corrected | a **source** — cite it like any other |

```
> Assumed: retention is 90 days — neither the brief nor the PRD states one.
  If it is 30, the partitioning in SI-2 changes.
```

Pick between the first two by the ceiling below: if a wrong value would change a contract, a schema or a boundary **and** nothing makes one value more defensible than another, it is `Needs Input`. Otherwise it is `Assumed`.

## 5. For a gate, say what is being decided

A gate is not "approve?". It is: what was produced, what needs attention **with each item resolved**, what happens next if approved, and what to say instead if not. The user should be able to answer without opening anything — and should be able to open everything, because you named the paths.

**Every `> Assumed:` in what was produced is part of the gate.** List them — value, what it rests on, what changes if wrong — as one grouped question, not one prompt each. On the answer, a confirmed one becomes `> Decided: <value> — owner, <date>` — rewrite the marker in place; that is a label, not a content change. A corrected one becomes `> Decided: <the new value> — owner, <date>` too, but the text around it has to change to match, so it goes through whoever owns the document: where a command says to re-run its agent rather than edit, re-run it with the correction. A marker left as `Assumed` after an approval means the gate was skipped, not that the assumption was accepted.

## 6. Recognise an assumption by what it is about, not by how sure you feel

Deriving a value and completing one read the same: same fluency, same confidence, same shape of sentence. Asking yourself *"am I inferring here?"* does not help, because the answer is generated the same way the value was. What does help is the **category**: some questions the repository and the upstream documents can never answer, and a value in one of these classes with no citable source is an assumption, however obvious it feels.

| Class | Example |
|---|---|
| Business threshold or policy | retention, rounding, what counts as "overdue" |
| Priority between goods that conflict | consistency vs latency, cost vs coverage |
| Authority and visibility | who may see or do what |
| Semantics of an external contract | what the third party guarantees, not what its docs say |
| Failure tolerance | what is acceptable when a dependency is down |
| A name that carries domain meaning | the ubiquitous language |
| Future intent | will this change? — which decides what is volatile, and so what is a detail |

These are the other half of §3. A **fact** — does this already exist, what does this function return — is yours to find, and not finding it is a grounding failure (`GR-N`), never an assumption to mark. A **decision** in one of these classes is what gets marked.

**The ceiling matters as much as the floor.** Mark a value only when a different answer would change the artifact — a contract, a schema, a boundary, a slice. A detector that fires on everything becomes an interrogation, and a user who is asked about everything stops reading the questions. If swapping the assumption changes nothing downstream, write the value and move on.
