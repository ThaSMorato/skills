<!--
TEMPLATE: design-system (the project's visual system, inventoried from its code)
Filled by /ui-design, and only when the project already has a design system: tokens, a theme or a
component library. A project with none gets no file. Every value cites where it is defined
(`file:line`); a component is listed only if it exists. The prose says how to apply the values;
the values come from the code. PRUNE optional sections that don't apply.
The written file STARTS with the frontmatter below; this comment is not copied.
-->

---
kind: design-system
plugin_version: <the "version" in ${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json>
inventoried_at: <git rev-parse HEAD>
sources: [<the files the values were read from>]
---

# Design system

## Overview (required)
> What the product should feel like, and for whom, in the owner's words; dense or spacious.

## Colors (required)
| Role | Token | Value | Defined at |
|---|---|---|---|
> Roles: surfaces, primary and secondary text, action, focus and selection, borders, success,
> warning, error, info. Both themes when there are two.

## Typography (required)
| Role | Token | Family | Size | Weight | Line height | Defined at |
|---|---|---|---|---|---|---|
> The case convention the product uses (sentence or title case) for headings and buttons.

## Spacing and layout (required)
> The spacing scale, the grid or layout model, the maximum widths, the breakpoints.

## Shape and elevation (optional)
> Radii, borders, shadows, and how depth is shown.

## Components (required)
| Component | Path | Variants | States it handles |
|---|---|---|---|

## Rules (optional)
> The team's rules, one line each, named: "One primary action per screen", "One radius family".
