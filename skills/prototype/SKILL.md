---
name: prototype
description: 'Answer one design question with throwaway code before it is designed for real: a clickable HTML demo for a state model or business logic, or switchable variants of a UI on its real page. Use when a decision in /design, /fdd or an interview cannot be settled on paper ("does this state machine hold up", "what should this screen look like"), or on "prototype / spike / try it out". Not for building the feature: that is /design → /plan → /implement, test-first.'
disable-model-invocation: true
---

A prototype is **throwaway code that answers one question**. Some decisions look fine on paper and only feel wrong once someone pushes them through a real case or sees them on the screen; a prototype gets that reaction before the design is written, when changing it costs a conversation instead of a rewrite. The question decides the shape, and the answer, not the code, is what the flow keeps.

## 1. Name the question, then the branch
Write the question in one sentence and show it: *"Can an order be partly cancelled after one of its shipments has left?"* A prototype that answers the wrong question is pure waste.

Then pick the branch by what the question is about:
- **Logic**: a state model, the transitions, the shape of the data, what is legal when. → [`logic.md`](logic.md): one HTML file anyone can open and click through.
- **UI**: what a screen should look like. → [`ui.md`](ui.md): several structurally different variants on the real page, switched from the URL.

When the question is ambiguous and the owner is not there to answer, take the branch that matches the code it is for (a backend module → logic, a page or component → UI) and state that assumption at the top of the prototype.

**Done when** the question is written down and the branch is chosen.

## Rules for both branches
- **Throwaway, and marked as such.** Put it next to what it prototypes so the context is obvious, and name it so nobody mistakes it for production (`prototype` in the file or route name). Follow the project's routing and file conventions.
- **Trivial to run.** A logic demo opens by double-click; a UI prototype starts with one command from the project's task runner. Say the command.
- **In memory.** No persistence, unless persistence is the question; then a scratch store named so it is obviously disposable.
- **No polish.** No tests, no error handling beyond what keeps it running, no abstractions. A prototype is outside the test-first rule because it never merges: the decision it validates is built again, test-first, by `/implement`.
- **Show the state.** After every action (logic) or variant switch (UI), the full relevant state is visible.

## 2. Hand it over, and listen for the surprise
Give the owner the file or the URL, and whoever else holds the knowledge (a designer, a PM, a domain expert). The useful moments are *"wait, that shouldn't be possible"* and *"I want the header from B with the list from C"*: they are bugs in the idea, found before any of it was built. Add the actions, scenarios or variants they ask for; a prototype evolves until the question is answered.

**Done when** the owner states the answer.

## 3. Capture the answer, then the prototype
Write `.scratch/<feature-slug>/prototypes/<slug>.md` (or `.scratch/standalone/prototypes/<slug>.md`):

```markdown
---
kind: prototype
slug: <slug>
branch: <logic | ui>
status: answered | abandoned
kept_on: <the throwaway branch, or `deleted`>
---
```

Then the **question**, the **answer** (with who gave it), **what surprised** (the reactions that changed the idea), and the **decision-bearing snippet**, when there is one: the reducer, the state machine, the schema, the type shape that says the decision more precisely than prose. Trim it to the decision; it is not a demo.

The answer becomes a `> Decided:` in the document that was waiting on it (the node map's Open decisions, the FDD, the brief), citing this file; a ticket may quote the snippet, marked as coming from a prototype (`/tickets` allows exactly this exception).

The prototype code itself does not merge. Suggest committing it to a throwaway branch (`prototype/<slug>`) as the primary source and recording that branch in `kept_on`, or deleting it; version control is the owner's call. **Done when** the answer is at its destination and nothing of the prototype is left on the working branch.
