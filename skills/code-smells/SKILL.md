---
name: code-smells
description: A catalog of code smells — named symptoms that a design is drifting — with the tell for each and the refactoring that resolves it. Use when reviewing code or a diff, implementing or refactoring, deciding "is this well designed?", or when someone says "code smell" or asks to refactor this.
---

Code smells are **labelled heuristics, not hard rules** — each is a judgement call. A smell flags something *worth a second look*, not a guaranteed defect; the repository's own guidelines and context always override this catalog. Many smells have a legitimate twin (an honest DTO, deliberate delegation, a small class with a clear concept) — name the smell, then judge.

Scan the table below and match what you see to a smell. Read the smell's rule file **only when a row matches** — each holds the full tell, why it hurts, and the fix. Group by family: the family tells you the kind of pressure the smell puts on the code.

## Bloaters — grew beyond what they should
| Smell | Tell | Rule |
|---|---|---|
| Primitive Obsession | raw primitive stands in for a domain concept | `rules/primitive-obsession.md` |
| Magic Numbers | unnamed literal buried in the code | `rules/magic-numbers.md` |

## Object-orientation abusers — use OO wrong
| Smell | Tell | Rule |
|---|---|---|
| Refused Bequest | subclass inherits what it doesn't want | `rules/refused-bequest.md` |
| Temporary Field | field valid only some of the time | `rules/temporary-field.md` |
| Alternative Classes w/ Different Interfaces | equivalent classes, divergent APIs | `rules/alternative-classes-different-interfaces.md` |

## Change-preventers — freeze the code
| Smell | Tell | Rule |
|---|---|---|
| Divergent Change | one class changes for many reasons | `rules/divergent-change.md` |
| Shotgun Surgery | one change edits many classes | `rules/shotgun-surgery.md` |
| Parallel Inheritance Hierarchies | new subclass here forces one there | `rules/parallel-inheritance-hierarchies.md` |

## Dispensables — should disappear
| Smell | Tell | Rule |
|---|---|---|
| Dead Code | never executed / commented-out | `rules/dead-code.md` |
| Lazy Class | class doesn't pay its own cost | `rules/lazy-class.md` |
| Data Class | only getters/setters, no behavior | `rules/data-class.md` |

## Couplers — couple too much
| Smell | Tell | Rule |
|---|---|---|
| Inappropriate Intimacy | two classes reach into each other's internals | `rules/inappropriate-intimacy.md` |
| Middle Man | class only delegates, adds nothing | `rules/middle-man.md` |

## Cross-cutting / well-known
| Smell | Tell | Rule |
|---|---|---|
| Anemic Domain Model | data with no behavior, logic in services | `rules/anemic-domain-model.md` |
| Callback Hell | hidden side effect / nested async | `rules/callback-hell.md` |

## Ousterhout red flags — module & interface structure
| Smell | Tell | Rule |
|---|---|---|
| Shallow Module | interface as complex as the payoff | `rules/shallow-module.md` |
| Information Leakage | one design decision known to several modules | `rules/information-leakage.md` |
| Temporal Decomposition | modules sliced by execution order, not knowledge | `rules/temporal-decomposition.md` |
| Overexposure | common case forced to learn rare features | `rules/overexposure.md` |
| Pass-Through Methods | method only forwards its arguments | `rules/pass-through-methods.md` |
| Pass-Through Variables | variable dragged through a chain that doesn't use it | `rules/pass-through-variables.md` |
| Conjoined Methods | two methods only make sense read together | `rules/conjoined-methods.md` |
| Special-General Mixture | general mechanism polluted with one specific use | `rules/special-general-mixture.md` |

## Ousterhout red flags — comments & names
| Smell | Tell | Rule |
|---|---|---|
| Comment Repeats Code | comment restates what the code already says | `rules/comment-repeats-code.md` |
| Implementation Doc Contaminates Interface | interface doc leaks internal detail | `rules/implementation-doc-contaminates-interface.md` |
| Nonobvious Code | meaning doesn't jump out on first read | `rules/nonobvious-code.md` |
| Vague Name | generic name (`data`, `tmp`, `result`) reveals nothing | `rules/vague-name.md` |
| Hard to Pick Name | can't find a good name — design is confused | `rules/hard-to-pick-name.md` |
| Hard to Describe | needs a long, caveat-heavy description | `rules/hard-to-describe.md` |
