> Part of the `asking` skill (see `SKILL.md`). Read when putting a gate to the owner: the approval of what a stage produced.

## 5. For a gate, say what is being decided

**Push the checkpoint right.** Do all the work you can before involving the user, so they are asked once, late, with everything prepared, instead of several times along the way.

A gate is not "approve?". It is a **brief**: what was produced, why, what needs attention **with each item resolved**, what happens next if approved, and what to say instead if not, with the path to each artifact. The user reads the brief, never the raw output: not the full document, not the tool's log, not the list of every finding. They should be able to decide without opening anything, and be able to open everything, because you named the paths.

**A gate on this stage's own work has no recommended "approve".** The stage that produced the work is the worst judge of it: offer approve among the options, without the recommendation, and let the brief carry the evidence. **A decision that blocks the next step is asked with the structured-choice tool**, never left as a question at the end of a prose turn, where it reads as a remark and the turn ends without an answer.

**Say exactly what the approval covers.** The count in words and the list ("this approves tickets 01 and 02, and nothing else"), and anything produced beyond what was asked for (a placeholder, a follow-up, an extra file) named on its own line with its own question. An approval that silently covers more than the brief names is not an approval of that part.

**Every `> Assumed:` in what was produced is part of the gate.** List them (value, what it rests on, what changes if wrong) as one grouped question, not one prompt each. On the answer, a confirmed one becomes `> Decided: <value> — owner, <date>`: rewrite the marker in place, its callout line too (`[!WARNING]` becomes `[!NOTE]`); that is a label, not a content change. A `Decided` that amends a document already approved changes the rule **everywhere the document states it**, not only next to the marker: grep the rule's other mentions and rewrite them too. A corrected one becomes `> Decided: <the new value> — owner, <date>` too, but the text around it has to change to match, so it goes through whoever owns the document: where a command says to re-run its agent rather than edit, re-run it with the correction. A marker left as `Assumed` after an approval means the gate was skipped, not that the assumption was accepted.
