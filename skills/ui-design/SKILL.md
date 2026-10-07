---
name: ui-design
description: 'Design a new screen or redesign an existing one before it is built: classify what is already true (redesign, an established visual world, or none), write the screen brief in rounds, propose three genuinely different directions as HTML with captures, refine the chosen one through every state and width with an isolated critic, and write the screen spec that /design builds from and /acceptance checks against. Use when a screen has no design to copy, or on "design / redesign this screen".'
disable-model-invocation: true
---

The rest of the flow builds and checks what a design says. When there is no design, someone still decides the hierarchy, the layout, the states and the copy, usually in the middle of implementing, one component at a time. This stage makes those decisions first, with the owner, and writes them down.

## 1. Decide what is already true
Read the PRD or FDD and the ticket for the screen, `CONTEXT.md`, the ui-audit when this is a redesign (`.scratch/ui-audit/<screen>/audit.md`), and `docs/design-system.md`. When the project has a design system and that file does not exist yet, write it first (`design-system.md`). Then classify, and say it to the owner:

| Situation | What it means |
|---|---|
| **Extending a surface** | a section, state or component inside an existing screen: inherit everything, no directions; go to step 4 |
| **A new screen in an established world** | the product has a visual system: keep it fixed; the directions vary the structure, never the look |
| **A redesign** | keep the product truth (content, function, the user's habits); the old look is evidence to learn from, not a constraint, and the audit's problems are what the design must solve |
| **No visual authority** | greenfield, nothing to inherit: the directions also propose the visual language, for the owner to choose |

Name the **surface mode** too (operate, read, persuade, experience; see `${CLAUDE_PLUGIN_ROOT}/skills/ui-audit/SKILL.md`, step 1). Coherent existing code is a visual world even with no design-system file.

**Done when** the situation and the mode are named and the owner has confirmed them.

## 2. The brief
Call the Skill tool with `asking`, and ask in rounds of two or three questions, stating your likely reading for the owner to correct rather than sending a questionnaire. Never ask for CSS values. Cover:
- **Job**: who arrives, in what situation, and the one thing they must understand or do; what success looks like.
- **Content**: every piece of data and copy, with realistic **minimum, typical and maximum** (the longest name, a thousand rows, an empty field), and where each one comes from.
- **States**: first use, empty, loading, error, partial, success, no permission, overflow; which matter here.
- **Boundaries**: what must not change, what is out of scope, what would make a polished result feel wrong.
- **Constraints**: the device classes and widths, the platform conventions, deadlines, the design system's rules.

Look facts up instead of asking them (the content's limits are in the schema; the components are in the code). What nobody can answer is marked `> Assumed:`.

**Done when** the brief is written in the spec's Brief section and the owner has confirmed it; the decisions a builder must not invent are listed as open or decided.

## 3. Directions
Follow `directions.md`: three directions of equal weight, each a short contract and a built HTML page with captures, plus the category-standard option. Build them:
- **brownfield**: as a throwaway page or route inside the project, with its real components and tokens, so what the owner approves is buildable as shown;
- **greenfield**: as one standalone HTML file per direction (call the Skill tool with `visuals` for the HTML conventions).

Either way it is disposable: `${CLAUDE_PLUGIN_ROOT}/skills/prototype/SKILL.md` says how a throwaway is kept apart and removed. Show the captures side by side and ask which direction, or which parts of which, as a multi-select.

**Done when** the owner has chosen, and the chosen contract is recorded as `> Decided:`.

## 4. Build it out, then critique
Take the chosen direction through every state in the brief and every width, with the brief's real content at its maximums. Apply `principles.md`. Then verify in **bounded rounds**: one batched round of captures (every state at a phone and a desktop width, motion settled first, each file opened to confirm it shows what its name says), then call the Agent tool with `ui-critic` with the captures, the brief and the contract. Fix everything it returns in one batch and run at most one more round. Two rounds, then stop polishing and report what is left.

For accessibility, call the Skill tool with `ui`; its catalog applies to the built pages like to any UI.

**Done when** the critic returns **ship**, or the second round is done and the remaining findings are listed for the owner.

## Output
Write `docs/ui/<screen-slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/ui-spec.md`, with the final captures under `docs/ui/<screen-slug>/`. The spec is the screen's source of truth: `/design` builds its node map from it, `/acceptance` compares the running screen against its states and widths, and the next redesign starts from it. Remove the throwaway pages.

## Gate
The brief for the spec: the direction and why, the states and widths covered, the critic's verdict, the decisions still open, every `> Assumed:`, and the audit problems (`UA-N`) each part solves, when this was a redesign. Next: `/tickets` or `/design` for the work that builds it.
