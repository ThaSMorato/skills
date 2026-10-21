---
name: ui
description: 'A self-contained catalog of user-interface defects you can see in a diff: keyboard access, focus, accessible names, contrast, the loading / empty / error states, errors found too late, signals that contradict the risk of an action, layout shift and slow interactions, each with its tell, its failure scenario and its fix. Use when reviewing a change that touches UI code, or when building a component or a page and asking "is this usable and accessible". Not for visual design taste, and not for how to test UI (the testing skill has that).'
---

# UI

A UI works when **every user can operate it and always knows what is happening**. Most UI defects are invisible to the author, who uses a mouse, a fast machine and a fast network, and already knows what the screen means. This catalog is the view from the other side: the keyboard user, the screen-reader user, the person on a slow connection or a small screen.

Read a rule file **only when its row matches**. Every finding carries **the rule**, a **concrete failure scenario** (who, doing what, gets what), and **the fix**. The repository's stack guide and design system come first: a component library may already handle focus or labels, so check what it provides before flagging.

## Operable by everyone
| Defect | Tell | Rule |
|---|---|---|
| Not keyboard-operable | a click handler on a non-interactive element; a custom control with no key handling | `rules/keyboard-access.md` |
| Focus lost or trapped | a modal, route change or removed element leaves focus nowhere, or nowhere to leave | `rules/focus-management.md` |
| No accessible name | an icon button, input or image with nothing a screen reader can announce | `rules/accessible-names.md` |
| Insufficient contrast | text or a control indicator below the contrast ratios; meaning carried by color alone | `rules/color-contrast.md` |

## Signals what each action risks
| Defect | Tell | Rule |
|---|---|---|
| Signal contradicts risk | a destructive or irreversible action styled like the primary one; a risky option as the default or the first example; a dangerous action indistinguishable from its safe neighbour | `rules/signal-mismatch.md` |

## Always says what is happening
| Defect | Tell | Rule |
|---|---|---|
| Missing states | data-driven UI that renders only the success case: no loading, empty or error state | `rules/async-states.md` |
| Error too late or detached | a check only after submit; a multi-step action that fails midway for a reason knowable up front; an error banner far from its field, the input cleared | `rules/late-error.md` |

## Stays still and responds
| Defect | Tell | Rule |
|---|---|---|
| Layout shift and slow interaction | media without dimensions, content inserted above what the user is reading, heavy synchronous work in an input handler | `rules/layout-shift-and-latency.md` |

## Calibration
- **A diff shows the pattern, not the measurement.** Contrast can be computed from the colors in the diff; layout shift and interaction latency cannot be measured from it. Flag the pattern that causes them, and say how to measure (the browser's performance tools, a lab run of the page).
- **Automated accessibility checks catch about half of the problems** (`testing` → frontend patterns). A green axe run is a floor; the rules above include what it cannot see.
