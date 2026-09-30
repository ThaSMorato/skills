> Part of the `ui` skill (see `../SKILL.md`). WCAG 2.1.1, 2.1.2.

# Not keyboard-operable

**The tell.** A click handler on an element that is not interactive (`div`, `span`, `li`) with no `tabindex`, no role and no key handling; a custom control (dropdown, slider, tab set, menu) that responds to the mouse only; `outline: none` with no visible replacement; `tabindex` greater than 0.

**Failure scenario.** A keyboard or switch-device user tabs through the form and never reaches "Continue", because it is a styled `div`. Or they reach it, cannot see where focus is, and press Enter on the wrong thing.

**The fix.** Use the native element (`button`, `a href`, `input`, `select`): it is focusable, announces its role and handles Enter and Space for free. For a custom widget, follow its ARIA pattern: the role, `tabindex="0"`, and the keys users expect (arrows in a menu or tab set, Escape to close). Keep a visible focus indicator (`:focus-visible`), and let the DOM order be the tab order.
