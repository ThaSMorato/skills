---
name: questionnaire
description: 'Turn decisions the owner cannot answer alone into a questionnaire for the person who can, and later fold the filled answers back into the documents that were waiting on them. Use when an interview, a design or a gate is blocked on someone outside the conversation (a PM, another team, legal), or on "questionnaire / send these questions to / ask the PM".'
disable-model-invocation: true
---

Some answers are not with the owner: they are with a PM, another team, legal, a client. Guessing them produces an `> Assumed:` nobody can confirm; leaving them as open questions in a document nobody sends produces nothing. This stage writes the questions down for that person, and brings their answers back.

## Write mode
**Interview the owner only about the send**, which they can always answer. The questions in the document then aim at the gap between what the recipient knows and what the owner needs.

1. **Who it goes to.** In one exchange: the recipient's role, what they know that the owner does not, and how they will answer (alone and async, or together in a meeting). That sets the tone and how much context the document carries. **Done when** you can say what the recipient knows that the owner lacks.
2. **What must come back.** Gather the decisions first from the artifacts: the `Open questions` of the brief or the PRD with this holder, the `> Needs Input:` markers, the blocking items of a gate. Show them, and let the owner add or drop. **Done when** there is a list of the decisions or facts the owner must walk away able to settle.
3. **Write it** to `docs/questionnaires/<YYYY-MM-DD>-<slug>.md` with the structure below. **Done when** the file exists and every item from step 2 is covered by a question that names where its answer will land.

### Structure
```markdown
---
kind: questionnaire
to: <role or name>
status: sent
asks: [<each source it answers: docs/requirements-brief.md#open-questions, docs/prd.md (Needs Input: RF-004), …>]
---

# <title>

**Purpose:** the decision riding on this, in one sentence.
**From:** <owner> · **To:** <recipient> · **Your answers go to:** <the documents, by name>

## Context
One paragraph that orients someone who was not in the conversation. Enough to answer well; use the glossary's terms and define any the recipient may not share.

## How to answer
The deadline and the rough effort. "I don't know" and partial answers are useful: flag what you are unsure of instead of skipping it.

## <Theme>
### <One question, one idea, never compound>
_Why it matters:_ only when the question could be misread or invite a throwaway answer.
_Options we see:_ only when the answer is a closed set, each with what it would mean.

> 

## Anything else?
What we did not ask and should know.
```

Order the questions most important first, since an async answer may be the only pass; group them under a `##` per theme once there are more than a handful. Each question resolves its ids as the `asking` skill says: the recipient has none of the owner's context.

## Read-back mode
`/questionnaire <path>` on a file with answers filled in:
1. For each question, find its answer and the source it was asked for (`asks`).
2. Turn each answer into a `> Decided: <value> — <recipient>, <YYYY-MM-DD>` at its source: the open question, the `> Needs Input:` marker, the assumption it settles. When the answer changes text around the marker, the document's owner stage makes that change (re-run its agent with the decision), as `asking` describes for a corrected assumption.
3. Questions left unanswered or marked unsure stay open at their source, with a note that they were asked and when.
4. Set the questionnaire's `status: answered` (or `partial`).

**Done when** every answered question shows up as a `Decided` marker at its source, and every unanswered one is still open there with the date it was asked.
