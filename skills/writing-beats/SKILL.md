---
name: writing-beats
description: 'Writing, exploit phase: turn a pile of raw material into a piece one beat at a time, choose-your-own-adventure style, never using a concept before it is grounded. Use with a fragments file or any raw notes, on "/writing-beats" or "turn these notes into a post".'
disable-model-invocation: true
argument-hint: "<path to the raw material> [path to the article]"
---

This is **exploit**: the exploring is done and the pile is fixed. Commit to a path through it, one beat at a time, mining the pile to fill each one. The raw material is read-only here; the piece goes to a separate file. If no article path was given, ask once and keep it.

## A beat
One move in the journey, which does one thing and stops: sets a scene, lands a point, asks a question, drops an aside, turns the angle. Sized by what it needs: one sentence ("And then nothing happened for three weeks."), a paragraph with setup, or several paragraphs for a self-contained story or argument. A "beat" that needs subheadings is two beats; split it.

## Grounding decides what can come next
No beat may lean on a concept the reader does not have yet. The rule, and how to keep the running list, is `${CLAUDE_PLUGIN_ROOT}/skills/doc-validate/grounding.md`; here the reader is the piece's audience, not a design document's. Each beat **requires** grounded concepts and **grounds** new ones, and a beat is reachable only when everything it requires is already grounded. That is what shapes the choices.

## The loop
1. **Settle the prerequisites** with the author: what the audience already knows walking in. Demand too much and you lose readers; ground too much inside and the opening drowns. **Done when** the starting grounded list is written down.
2. **Offer 2 or 3 starting beats**, each a different way into the piece, drawn from the pile. For each, say what it grounds. The author picks (or combines).
3. **Write only that beat** to the article file. Stop.
4. **Re-read the article from disk**, then offer 2 or 3 next beats, each a different direction from where the piece now stands, each reachable from the grounded list, each saying what it grounds.
5. **Loop** 3 and 4 until the piece reaches a natural end, which is when the journey is complete, not when the pile is empty. Leftover fragments are normal: that is why there was more material than needed.

## Rhythm
Append one beat at a time; never write ahead. Re-read the file before every write and keep the author's edits absolutely; a substantial edit to an earlier beat may change what comes next. "Rewrite that beat" or "try a different beat 3" is done in place, leaving the rest alone.
