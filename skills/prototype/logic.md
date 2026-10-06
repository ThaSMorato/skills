> Part of the `prototype` skill (see `SKILL.md`).

# Logic branch: a clickable demo of the model

One self-contained HTML file that lets anyone drive a state model by clicking buttons. It is for the questions about business logic, transitions and data shape that only feel wrong once pushed through real cases. Because it needs nothing installed, it can go to someone who does not read code, so it speaks their language.

## 1. Put the question at the top
The question from the skill's step 1, as a visible paragraph at the top of the page, not a code comment: whoever opens the file later must be able to check what it was for.

## 2. The logic is a pure module
The part that answers the question lives in one `<script>` block, written as a small module that could be lifted into the real codebase: no DOM, no `document`, no handlers reaching inside it. The page calls into it; nothing flows the other way. Pick the shape the question needs, not the one easiest to wire:
- a **reducer** `(state, action) => state`, when actions are discrete events over one state value;
- a **state machine** with explicit states and transitions, when "which actions are legal now" is part of the question;
- **pure functions** over a plain data type, when there is no current state, only transformations;
- a **module with a method surface**, when the logic really owns ongoing state.

## 3. The page, for someone who does not read code
Plain HTML, CSS and JavaScript inline in one file: no framework, no bundler, no server. Every label in **domain words** (the glossary's), never the reducer's. Top to bottom:
1. **Title** and the one-line question.
2. **Current state** as a readable panel (labelled fields, not a JSON dump), re-rendered after every click, with what just changed called out.
3. **Free play**: one button per action, always available, in any order.
4. **Guided scenarios**, one per tab: a plain description of the situation and what to watch for, then the steps as real buttons in order. Starting a scenario resets to a known state, so it runs the same way every time. Pick the cases that are hard on paper: the happy path, the awkward edge case, an attempt at something that should be illegal.

Clean and restrained: readable type, generous spacing, one accent color, no animation.

## What it is not
- No tests, no real database, no "what if we later support X". One question.
- The page shell never ships. The pure module is the part worth lifting, and it is rebuilt test-first when the decision is implemented.
