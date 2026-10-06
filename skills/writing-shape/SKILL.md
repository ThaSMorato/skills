---
name: writing-shape
description: 'Writing, exploit phase: shape a pile of raw material into an argued article, paragraph by paragraph, from a chosen opening, pushing back on every block that does not earn its place. Use with a fragments file, notes or a transcript, on "/writing-shape" or "make this into an article".'
disable-model-invocation: true
argument-hint: "<path to the raw material> [path to the article]"
---

This is **exploit**: the pile is fixed; commit to a structure and mine the pile to fill it. The pile can be anything (tidy fragments, a wall of prose, a transcript); read it end to end before doing anything else. It is read-only here; the article goes to its own file. If no article path was given, ask once and keep it.

## The loop
1. **Read the pile** in full, and say back what is in it.
2. **Settle the prerequisites**: what the reader knows walking in. From there, every concept must be grounded before a block leans on it, by `${CLAUDE_PLUGIN_ROOT}/skills/doc-validate/grounding.md`; keep the running list. **Done when** the starting list is written down.
3. **Draft 2 or 3 openings**, each implying a different thesis. Show them all; the author picks one or composes a hybrid. The opening is a promise: it decides what the rest must do.
4. **Grow block by block.** Ask, every time: *given what is on the page, what does the reader need next?* Pull the answer from the pile. An ungrounded concept the next move needs is itself the answer: ground it first. Argue the form of each block before writing it (below).
5. **Append each agreed block** to the article as soon as it is agreed, so the author watches it take shape.
6. **Loop** step 4 until the author says it is done.

## Push back
This is an interview turned around: the question is no longer "what are you noticing?" but "what is this arguing, and in what order must the reader hear it?". Refuse weak transitions. Keep asking:
- *What does this paragraph do that the previous one did not?*
- *If I cut this, what breaks?*
- *This sentence does two jobs: split it, or pick one.*
- *The opening promised X; we have drifted to Y. Re-thread it, or change the opening.*

When the pile lacks what the article needs, say so: *"We need an example here and the pile has none. Give me one now, or we cut this section."* Never invent the author's material.

## Argue the form, out loud
- **Prose or list**: prose carries an argument; a list carries parallel items. Items that are not truly parallel want prose.
- **Inline or callout**: a tip or a warning goes in a callout only when it would derail the argument inline.
- **Table or repeated structure**: the same shape with the same fields three or more times is a table.
- **Quote or paraphrase**: quote when the wording is the point; paraphrase when only the idea is.
- **Code block or inline code**: several lines, runnable or illustrative, is a block; one identifier is inline.

## Rhythm
Re-read the article from disk before every write; the author's edits win. A rewrite of one paragraph is done in place, leaving the rest alone. Publishing, platform formatting and frontmatter the author did not ask for are out of scope.
