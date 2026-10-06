> Part of the `teach` skill (see `SKILL.md`).

# Lessons

A lesson is one self-contained HTML file that teaches **one** tightly scoped thing and gives the learner one tangible win they can build on. Working memory is small: a lesson is completable in minutes.

## Shape
1. **What and why**, in two lines, tied to the mission.
2. **The knowledge** the skill needs, and no more, with a citation for every claim (a link into `RESOURCES.md`'s sources). Use a diagram where the shape is the point; the `visuals` skill lists the views.
3. **Practice** with immediate feedback: a quiz or a small in-browser task for knowledge, a guided list of real-world steps for a physical or tool skill. Ask for **recall**, not recognition, where possible: the learner produces the answer before seeing it.
4. **The primary source** to read or watch next: the best one in `RESOURCES.md` for this lesson.
5. **A reminder** that the learner can ask you follow-up questions about anything unclear.

Link other lessons and reference pages with anchors.

## Quizzes give no clues
Every option is the same length (in words, and characters where possible) and the same form, so the right answer cannot be spotted by formatting. Wrong options are the mistakes a learner would actually make, not jokes. Feedback says why an answer is right or wrong, not only which.

## Built from shared components
Before writing a lesson, read `assets/` and build from what is there. The first component every workspace earns is a **shared stylesheet**, linked by every lesson, so the lessons read as one course. A quiz widget, a simulator or a diagram helper a second lesson could use goes to `assets/` and is linked, never pasted inline.

## Look
Clean and readable, made to come back to and to print: generous spacing, a comfortable line length, restrained color, readable in light and dark. Think of a good textbook page, not a dashboard.

## Reference pages
Alongside a lesson, write or extend a `reference/` page with its compressed essence: syntax, a procedure, an algorithm, a table of terms. Lessons are rarely reopened; reference pages are.
