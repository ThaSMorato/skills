---
name: writing-for-agents
description: 'Use when someone asks to add, write or fix an instruction for an AI agent: a rule or a line in CLAUDE.md or AGENTS.md, a skill, an agent or command prompt, a stack or test guide, a guidelines router. The standard for a document an agent loads: what earns a line, where each piece sits, how a step ends, and the tests that find a sentence doing nothing. Load it before writing the first line, even when the change looks small. Not for prose people read; the writing stages (fragments, beats, shape) do that.'
---

An agent document is read on every run it loads into, by a reader that already knows most of what you could tell it. Every line is paid for in the agent's attention. The standard: say what changes behavior, where the agent will meet it, in the fewest words that anchor it. Apply every section below to the document in hand.

## Two loads
Every line spends one of two budgets.

- **Context load**: what always-loaded text costs the agent on every turn, whether or not it fires: a line in `CLAUDE.md`, a skill's description, a row of a router.
- **Cognitive load**: what the human pays to be the index of which documents exist and when to reach for each.

Text reached only through a pointer leaves the context load, at the price of the pointer's own line. Text with no pointer at all rides on the human remembering it.

## Pointers
A **pointer** is a line in context that names material outside it and says when to reach it: a skill's description, a row of `docs/guidelines.md`, a `CLAUDE.md` line naming a guide. Its wording, more than its target, decides whether the agent gets there.

- **Open with the trigger**, in words the task will contain: the file pattern, the error text, the command, the question as someone would ask it. Then say what the material is.
- **One trigger per branch.** A branch is a distinct case the document handles. Synonyms for one branch are that branch written twice: keep one.
- **Say what it is for and when, and leave the how to the body.** A pointer that lists the steps gets followed in place of the document.
- **Name the sibling** that owns a nearby request ("for behavior changes, `tdd`"). Two pointers with overlapping triggers fire wrong half the time.
- **For a problem the model believes it knows** (an N+1, an injection, a refactor), say to load the material before answering even when the problem looks familiar.

A must-have target behind a weak pointer is fixed at the pointer. Inline the material only when sharpening the pointer fails.

## Where each piece sits
A document holds **steps** (what the agent does, in order) and **reference** (definitions, rules, facts consulted on demand). Place each piece by how immediately the agent needs it:

1. **In-file step**: the primary tier.
2. **In-file reference**: consulted on demand. A flat set of peers (every rule of a review) is a fine shape.
3. **Disclosed reference**: a sibling file behind a pointer, loaded when the pointer fires.

- **Progressive disclosure** moves a piece down that ladder so the top stays legible. **Disclose by branch**: inline what every branch needs; put behind a pointer what only some branches reach. As a rough bound, reference under 50 lines stays inline and over 100 moves to a sibling file.
- **Co-locate**: a concept's definition, rules and caveats sit under one heading, so reading one part brings the rest.
- **Sprawl** is a document too long even when every line is live. The cure is the ladder, and a split by branch or by sequence so each path carries only what it needs.

## Steps end on a completion criterion
Every step, and the document as a whole, says how the agent knows it is done, with evidence someone else could check: "`npm test` is green", "the validation file says `status: clean`".

- **Clarity**: done and not-done can be told apart. A vague bound ("once you understand the module") lets the agent close the step early, pulled by the steps still ahead. Sharpen the bound first. Split the sequence only when the bound cannot be sharpened and the rush is observed, and only across a real context boundary: a subagent or a hand-off.
- **Demand**: how much it requires. "Every modified model accounted for" drives the digging that "produce a change list" does not.

The strongest criterion is checkable and exhaustive. Flat reference carries the same bar as "every rule applied".

## The tests for a sentence
Run each sentence through these. One that fails goes, whole: delete the sentence, never trim words from it.

| Test | The sentence fails when | What to do |
|---|---|---|
| **No-op** | the agent would do the same without it | delete it. Whether it is one is settled by running the document without it. A word too weak to beat the default ("be thorough") is a no-op too: use a stronger word ("relentless") |
| **Cache of the environment** | it restates `package.json` scripts, a config file, the directory layout or `--help` output | delete it and let the agent look. Write down what looking cannot find: the unwritten convention, the reason behind a choice, the gotcha no config confesses |
| **Single source of truth** | the same meaning already lives in another place | keep one home and point at it from the other |
| **Relevance** | it no longer bears on what the document does, or the behavior it describes has changed | delete it. Stale lines settle because adding feels safe and removing feels risky |
| **Wrong home** | it is a rule in an always-loaded file that only one kind of task needs | a mechanical rule (a pattern a linter, a hook or a CI job can see) becomes a check; a judgement rule moves to the stack guide or the review standard, which the reviewer reads with room to apply it; the always-loaded file keeps a pointer |

## Wording
- **Write the positive.** State the behavior you want ("write one-line comments"). A prohibition puts the forbidden behavior in context and makes it more available. Keep one only as a hard guardrail you cannot phrase positively, paired with the positive target.
- **Leading words.** Prefer a compact word the model already knows (*tracer bullet*, a *tight* loop, a test that goes *red*) over a sentence that gestures at the idea. Repeat the word, never the sentence: it anchors the same behavior each time it appears. A coined word has to be defined, so reach for an existing one first.
- **Imperative and specific.** Address the agent, and name the real thing: the path, the literal error, the actual command.

## Steering files
`CLAUDE.md` and `AGENTS.md` load into every session of a repository, and the user's global file (`~/.claude/CLAUDE.md`) into every session of every project: the dearest context there is. A steering file holds pointers and the few facts every task needs. A rule that grows there fails the **wrong home** test, and a rule the model already follows fails the **no-op** test.
