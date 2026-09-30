> Part of the `ui` skill (see `../SKILL.md`). WCAG 2.4.3, 2.1.2.

# Focus lost or trapped

**The tell.** A modal or drawer opens and focus stays on the page behind it; it closes and focus lands on `body`; a client-side route change leaves focus where the old page was; the focused element is removed (a deleted row, a dismissed toast) and nothing receives focus; a widget captures Tab and never lets go.

**Failure scenario.** A screen-reader user opens "Edit address"; the dialog appears, but focus and reading continue on the page underneath, so they never learn it opened. They close it and are sent back to the top of the page, and must navigate the whole screen again to find their place.

**The fix.** On open, move focus into the dialog (its first field, or its heading) and keep Tab inside it; on close, **return focus to the control that opened it**. After a route change, move focus to the new page's main heading. When the focused element is removed, move focus to its logical neighbor. Escape closes what it opened. A native `<dialog>` with `showModal()`, or the design system's dialog, usually does this already.
