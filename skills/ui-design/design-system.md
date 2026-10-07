> Part of the `ui-design` skill (see `SKILL.md`), step 1. Runs only when the project already has a design system.

# Inventory the design system

A design needs the project's visual system as a fixed input. When the project has one (tokens, a theme, a component library) and `docs/design-system.md` does not exist, write it once, from the code. **When the project has none, write nothing and propose nothing**: the screen's directions carry their own visual language (`directions.md`).

## Where to look, in order
1. CSS custom properties (`:root`, theme files).
2. The Tailwind config (`theme`, `extend`) or its CSS-first `@theme` block.
3. CSS-in-JS themes (styled-components, Emotion, vanilla-extract, Stitches).
4. Token files (JSON or YAML, Style Dictionary, Figma token exports).
5. The component library in use (the package and the local wrappers around it).
6. The global stylesheet.
7. Computed styles from the running app, when nothing above declares a value.

A value is recorded with where it is defined (`file:line`). Components are recorded only when they exist; the inventory never invents one.

## What only the owner can say
After the scan, ask in at most two rounds of up to three questions, and only about meaning: what the product should feel like, what each color is for, the rules the team follows (one radius family, one primary action per screen). Everything measurable comes from the scan.

## Output
Write `docs/design-system.md` from `${CLAUDE_PLUGIN_ROOT}/templates/design-system.md`. Existing file: update it with what changed, and ask before rewriting anything the owner wrote. `/ui-audit` checks drift against it, `review-ui` reads it for the tokens a diff should have used, and `/ui-design` holds every direction to it.
