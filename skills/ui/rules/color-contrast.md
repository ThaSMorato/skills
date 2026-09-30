> Part of the `ui` skill (see `../SKILL.md`). WCAG 1.4.3, 1.4.11, 1.4.1.

# Insufficient contrast, or color as the only signal

**The tell.** Body text below **4.5:1** against its background (3:1 for large text, about 24px, or 19px bold); a control's boundary or focus indicator below **3:1**; light gray placeholder or disabled-looking text that is actually required reading; an error, status or required field shown only by turning it red.

**Failure scenario.** On a phone in daylight, or for a user with low vision, the gray helper text under the password field disappears, and they never see the rule it states. A color-blind user cannot find which of the six fields is the one in error.

**The fix.** Compute the ratio from the two colors in the diff (any contrast checker) and use the design system's tokens that are known to pass. Pair color with a second signal: an icon, a text label, an underline, a border.
