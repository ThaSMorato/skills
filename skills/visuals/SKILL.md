---
name: visuals
description: 'How to show a design or a change as a picture instead of prose: pick the smallest view (pseudocode, call tree, component tree, file tree, Mermaid, diff sketch), rate a proposal by strength, and render an HTML report with before/after diagrams. Use when a stage presents a refactor or design proposal, a PR summary, a walkthrough of a change, or a report a human will decide from.'
---

A reader decides faster from a picture of the shape than from a paragraph about it. This is the reference every stage that **shows** something uses: the views, the rules that keep them honest, and the HTML report for when a page of cards beats a markdown list.

## Pick the smallest view
Use the one that makes the point with the fewest elements; combine two when one cannot carry it; rarely more.

| The point is about | View |
|---|---|
| logic or an algorithm | pseudocode, a few lines, no syntax noise |
| runtime control flow | a call tree (indented calls) |
| UI structure | a component tree, with the state and module boundaries that matter, and paths for the non-obvious ones |
| file responsibility, a broad refactor | a shallow file tree, one comment per entry |
| interaction or data flow between parts | Mermaid `sequenceDiagram` or `flowchart` |
| what changes, when the surrounding shape exists | a **diff sketch** of any of the above (`+` / `-` lines in a `diff` block) |
| a target shape the reader will copy | the whole block, when most of it is new or omitted context would hide order or ownership |

```diff
 submitForm
   createSession
     persistPrompt
+    expandSkillMention
     launchAgent
```

Keep only the calls, files, props, states and boundaries the current question needs. A view that shows everything shows nothing.

## Rules
- **Place each view next to the sentence it supports.** A diagram in an appendix is a diagram nobody connects to the claim.
- **If a diagram needs a paragraph to be understood, redraw it.** The paragraph is the sign that the view is the wrong one or carries too much.
- **Name the gain in the project's own terms**: the glossary (`CONTEXT.md`) for the domain, and the architecture vocabulary for structure (module, interface, depth, seam, adapter, leverage, locality, in the `architecture` skill's `rules/deep-modules.md`; plus coupling, cohesion and duplication). "Pricing stops leaking into the order handler", never "cleaner" or "easier to maintain": those name no property anyone can check.
- **Rate every proposal by strength**, so the reader knows where to spend attention:
  - **Strong**: the evidence is direct (`file:line`, a measured number, a repeated finding) and the gain is clear.
  - **Worth exploring**: the evidence is real, but the gain depends on something not yet known (a usage pattern, a future change); say what.
  - **Speculative**: a hunch with some evidence; listed so it is not lost, never applied without more.
- **A proposal that contradicts an ADR** carries a one-line callout naming the ADR and why reopening it may be worth it. List it only when the friction is real enough to reopen the decision.

## The HTML report
When a stage offers a report of several proposals or findings with before/after shapes (`/tidy <path>`, `/analyze`), render it with [`html-report.md`](html-report.md): one self-contained file, a card per item, diagrams carrying the weight. The markdown output stays the record; the HTML is the view a human decides from.
