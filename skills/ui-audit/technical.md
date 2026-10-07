> Part of the `ui-audit` skill (see `SKILL.md`). Assessment B, with `worst-case.md`; accessibility is the `ui` catalog's.

# Technical checks

Each check reads the running screen and its code. A finding carries what produced the evidence (a capture, a computed value, `file:line`) and what stayed untested.

## Design-system drift
Against `docs/design-system.md` when it exists, else against the tokens and components the codebase already defines:
- **Hardcoded values** where a token exists: colors, spacing, radii, font sizes, shadows.
- **The wrong token**: a semantic token used for another meaning (an error color on a brand accent).
- **A reimplemented component**: a local button, input or modal where the library has one.
- **Theme**: values that do not follow a theme switch, a dark mode that is a mechanical inversion.
- **One-offs**: the same thing styled three ways across the product.

Name the pattern when it repeats: one systemic finding ("hardcoded colors in 15 components") outranks fifteen local ones.

## Responsiveness
- Fixed widths that overflow; horizontal scroll at phone widths.
- Touch targets too small or too close for a thumb.
- Hover as the only way to reach an action.
- Text that does not scale with the user's settings, or breaks at 200% zoom.
- Missing breakpoints: the layout at the widths in between.
- Tables and multi-column layouts with no narrow-screen form.

## Integrity
- Copy that misleads: a label that says one thing and does another; a count that is not the count.
- Content that is filler: lorem ipsum, "John Doe", round fake numbers, placeholder images in production.
- Structure interchangeable with any product (the design-specificity verdict, from the technical side).
- Dead ends: links to `#`, buttons that do nothing, a screen with no next step.

## States and omissions
- Every data-driven region has loading, empty and error; every control has default, hover, focus, active, disabled, and loading where it triggers work.
- Empty states distinguish first use, no results, cleared filters, no permission and failure.
- No current-location indicator in the navigation.
- No way back from a deep screen.
- Validation missing or only on submit, with the user's input lost on error.
- A not-found page, and the legal and consent links the product needs.
