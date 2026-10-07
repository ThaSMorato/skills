> Part of the `ui-design` skill (see `SKILL.md`), step 4. The project's design system wins wherever it decides something; these fill what it leaves open.

# Principles

## Hierarchy and grouping
- **One primary action per view**, a few secondary ones, the rest in a menu. The primary action's color is not spent on decoration.
- **Group by meaning.** Proximity first: tight inside a group, generous between groups, more space above a heading than below it. A border or a background is a legitimate group too, when proximity alone does not separate it.
- **De-emphasize to emphasize.** Size is one lever among weight, color and contrast; when everything is emphasized, nothing is.
- **Choices**: as few as the task allows at each decision, with the recommended one visible. There is no fixed number; group long lists, offer search or filters before the user has to scan.
- **Familiar beats novel.** Users bring expectations from the products they already use; a standard pattern is learned already. Spend novelty where it serves this product.

## Layout and spacing
- A spacing scale, used everywhere (a 4-unit base gives the in-between steps an 8-only scale lacks). Rhythm comes from alternating tight and generous, not from one value repeated.
- Every element aligns to something on purpose: a grid, an edge, a baseline.
- Let the layout size itself (flex, grid, intrinsic sizes). A desktop layout has a maximum width; it does not stretch to fill a 4K screen.
- Repetition supports recognition: the same thing looks the same everywhere. Variety is not a goal.

## Type
- One or two families; when two, clearly distinct. A type scale with clear steps; adjacent sizes or weights that are almost the same are noise.
- Body text at least 16px on the web; 45 to 75 characters per line for reading (tables can be wider); line height grows with line length.
- Headings balanced across lines; no widow words.
- Numbers people compare use tabular figures; numbers, dates and currency follow the user's locale.
- **Case** (sentence or title case) follows what the project already uses; in a greenfield, ask.

## Color
- Color **roles**, not swatches: surfaces, primary and secondary text, action, focus and selection, borders, and success, warning, error and info.
- Secondary text on a colored surface is a tint of that surface's hue, never plain gray.
- Dark mode is designed, not inverted; a theme change remaps the semantic tokens.
- Contrast meets WCAG 2 AA in every state and both themes (the `ui` catalog has the ratios).

## States
- Every data-driven region: loading, empty, error, partial, success. Skeletons that mirror the final content for content areas; a spinner only inside a control.
- Every control: default, hover, focus, active, disabled, and loading when it triggers work. Read-only looks different from disabled.
- Empty states are of five kinds, each different: first use, no results, cleared filters, no permission, failure. Each says what will be here, why it matters and how to start.
- Edge content is designed, not discovered: the longest value, zero, one, a thousand (`${CLAUDE_PLUGIN_ROOT}/skills/ui-audit/worst-case.md`).

## Copy
- Words in the user's language, named by what users understand, not by the system's internals.
- A button says exactly what happens ("Save changes", not "Submit"); an action keeps one name through the flow (a "Publish" button produces a "Published" message).
- An error says what failed, why when it helps, and how to fix it, in the interface's voice; it keeps the user's input; it does not apologize or blame.
- Loading text names the real operation. A deliberate pause can make a weighty result feel considered; use it rarely and never fake progress.
- Each piece of text does one job; say each idea once. Plain, specific and active beats clever.

## Motion
- Motion explains: a state change, where something came from, feedback to an action. Motion that only decorates goes.
- **Entrance**: at most one orchestrated moment on a page; in operate mode, none.
- **Duration**: 100 to 160ms for press feedback, 150 to 250ms for menus and tooltips, up to 300ms for interface motion in general, up to 500ms for a modal or drawer. Exit faster than enter. Ease out on enter, never ease in.
- Frequency decides: what the user does a hundred times a day does not animate; what happens rarely may.
- Reduced motion keeps opacity and color changes and drops movement.

## App screens (operate mode)
- Restrained color: neutrals plus one accent for actions, selection and state.
- A standard state vocabulary across the product (hover, focus, active, disabled, selected, loading, error, warning, success, info).
- Responsiveness is structural: the sidebar collapses, the table changes form, not just shrinks.
- A modal is never the first idea: only for a task that needs to interrupt, or a focus that needs protecting.
- Utility copy: headings say what the area is or what can be done there; supporting text explains scope, freshness or consequence in one sentence. If a sentence could be in an ad, rewrite it.

## Breakpoints
Content decides them; three usually suffice (around 640, 768 and 1024px), written mobile first. Hover never carries a function; input type is detected with the `pointer` and `hover` media queries.

## Restraint
Spend boldness in one place: one memorable element, everything else quiet. Before finishing, remove one thing.
