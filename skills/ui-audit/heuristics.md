> Part of the `ui-audit` skill (see `SKILL.md`). Read by `ui-critic` for the design assessment and by `ui-design` for its self-critique.

# Heuristics, cognitive load, personas, severity

## The ten heuristics
Jakob Nielsen's ten usability heuristics (nngroup.com/articles/ten-usability-heuristics, credited as their author asks), restated for checking. Score each **0 to 4**: 0 absent or broken, 1 major failures, 2 partial, 3 good with small gaps, 4 genuinely excellent. Most real interfaces land between 20 and 32 out of 40; a 4 is rare.

| # | Heuristic | Check for |
|---|---|---|
| 1 | Visibility of system status | Every consequential action gets feedback, fast; the user always knows what is happening and whether it worked |
| 2 | Match with the real world | The user's words, not internal jargon; things in the order the user expects them |
| 3 | User control and freedom | A labeled way out of every flow (cancel, back); undo where an action can be regretted |
| 4 | Consistency and standards | Same thing, same name and look, across the product; platform and category conventions followed |
| 5 | Error prevention | Error-prone conditions removed, constrained or confirmed; the costly errors first; good defaults |
| 6 | Recognition rather than recall | Options, labels and needed information visible or one step away; nothing carried in memory between screens |
| 7 | Flexibility and efficiency | Accelerators for frequent users (shortcuts, bulk actions) that novices never need to see |
| 8 | Aesthetic and minimalist design | Nothing irrelevant competing with what the task needs |
| 9 | Recover from errors | Plain message, the precise problem, the way to fix it; the user's input kept |
| 10 | Help and documentation | Rarely needed; when needed, in context at the moment of need, as concrete steps |

Heuristics 7 and 10 may be `n/a` on a persuade or experience surface. Then the maximum shrinks (`/32`), and the score is never printed over the full 40.

| Score | Band |
|---|---|
| 36-40 (90%+) | Excellent |
| 28-35 (70%+) | Good |
| 20-27 (50%+) | Acceptable |
| 12-19 (30%+) | Poor |
| 0-11 | Critical |

## Cognitive load
Three kinds: **intrinsic** (the task's own difficulty: structure it), **extraneous** (the interface's noise: remove it), **germane** (learning the task: support it). Check:
1. One clear focus per screen region.
2. Content chunked into groups.
3. Related things grouped (proximity first; a border or background when proximity is not enough).
4. A visible hierarchy: the eye knows where to go first.
5. One decision at a time.
6. The options at each decision are as few as the task allows, the recommended one visible.
7. Nothing the user must remember from another screen.
8. Detail disclosed progressively, when needed.

Zero or one failure is low load, two or three moderate, four or more critical. There is no fixed count of options or items: judge each group by the task and its context, and group before you cut.

**Common violations:** the wall of options; the memory bridge (copy this from the other screen); hidden navigation; jargon; a visual noise floor (everything emphasized, so nothing is); inconsistent patterns for the same action; one screen demanding several tasks at once; a context switch in the middle of a task.

## Personas
Walk the task as two or three of these, chosen by the screen. A project persona is used only when real audience data supports it; never invent one.

| Persona | Walks the task as | Fails when |
|---|---|---|
| **Power user** | daily, fast, keyboard, bulk | no shortcuts, no bulk action, Esc does nothing, the core task takes over a minute |
| **First-timer** | first visit, no context | the first action is not obvious within seconds, icons have no labels, no way back |
| **Stress tester** | 0 items, 1,000 items, the longest name, refresh mid-flow, two tabs | the layout breaks, state is lost (`worst-case.md` is this persona, run with data) |
| **Distracted mobile** | one thumb, interruptions, slow network | targets out of thumb reach, state lost on interruption, nothing loads on 3G |

The keyboard-only and screen-reader user is the `ui` catalog's subject; run it there.

| Screen | Personas |
|---|---|
| dashboard, data-heavy | power user, stress tester |
| form, wizard, checkout | first-timer, distracted mobile, stress tester |
| onboarding | first-timer, distracted mobile |
| landing | first-timer, distracted mobile |

## Design specificity
Could an unrelated product use this screen unchanged, with only the name swapped? A screen that answers "yes" has not been designed for its users, whatever its polish. Report the verdict with the reason.

## Severity
Rate **after** the evaluation, from four factors: how often it happens, how hard it is to get past, whether it hurts once or every time, and what it costs the business.

| Level | Means | Tiebreak |
|---|---|---|
| **P0** | blocks the task | the user cannot finish |
| **P1** | major difficulty; fix before release | the user would contact support |
| **P2** | minor, with a workaround | the user is slowed, not stopped |
| **P3** | polish | noticed only on inspection |

Not everything is P0. A report where most findings are P3 is noise: keep the P3s that form a pattern, list the rest in one line.

## How to write a finding
Direct and specific: "the Submit button in the payment step", never "some buttons". What is wrong, why it matters to whom, the direction of the fix. No "consider exploring". Include the strengths: what works and must survive a redesign.
