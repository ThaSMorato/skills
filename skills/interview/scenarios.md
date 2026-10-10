> Part of the `interview` skill (see `SKILL.md`). Also read by `prd-writer`, `acceptance` and the `testing` skill: the guiding scenario is the one artifact every one of them carries forward.

# Guiding scenarios

A **guiding scenario** is a user story told in full: a specific person, with a reason, simulated step by step as they discover and use the product to solve their problem. A list of requirements is a set, and a missing item makes no noise; a scenario is a sequence, and step 4 without step 3 is visibly impossible. That is why a plot hole in a scenario is easier to find than a gap in a requirements list, and why the same scenarios are carried through every document: they become the PRD's requirements, the first milestone, the scenario tests, and the walk `/acceptance` takes at the end.

Keep **one to three** per brief: the most important and illustrative stories, the ones the roadmap would be built around. More than three is a list again.

## Format
```markdown
### GS-1: <the outcome, in the persona's words>
- **Persona:** <a specific person: role, what they already know, what they can and cannot do, how often they use the product>
- **Motivation:** <what they need at this moment, and why: "close the month's report before tomorrow's board meeting", not "export a CSV">
- **Simulation:**
  1. <what they do first, including how they find out the product can help>
  2. <next step>
  3. <… until the persona's goal is met, not until the system returns 200>
- **Edge cases met on the way:** <empty data, the missing permission, a second user changing the same thing>
```

Ids are permanent: `GS-1` keeps its number when another scenario is added or one is retired, as requirement ids do.

## Shoe-shifting: review every scenario before it is written down
Step into the persona and replay the simulation knowing only what they would know. At **each step** ask:
1. **What happened before?** What brought them here, and how did they know what to do?
2. **What happens after?** The scenario ends when the *persona* has what they came for.
3. **Does this step need more detail?** A vague step ("the user configures the integration") hides several, and the problem lives in one of them.

**Done when** every step has a step before it that makes it possible, and the last step is the persona's goal met. Each hole it finds is a missing step, an edge case, or a fact only the team knows (a term, an id, where a screen is); write the step in, or record the gap as an edge case.

## Strawman users: the persona must not be one of these
A persona that conveniently accepts whatever the product offers hides the product's failures. Check the persona against the five:

| Strawman | Accepts | Hides |
|---|---|---|
| **Irrational actor** | choices that contradict their own incentives | that nobody would actually switch |
| **Enthusiastic fan** | every new feature, on sight | that the value is not obvious |
| **Stoic user** | complexity, slowness, breakage; learns whatever is needed | the cost of the friction |
| **Clone** | knows the system as well as the team | missing discovery; the curse of knowledge |
| **Your parent** | a real person, but one or two of them | that there is a market |

A persona that matches a row is rewritten from a real user, or the scenario is marked `> Assumed:` with what would confirm it.

## Who it is for, and who it is not
A target audience exists only when all four hold: it is a **real** group, it has a **strong motivation** compared with what it uses today, it has the **means** to get and use the product, and it has **no strong reason** to avoid it.

Name the **nonpersonas** too: who the product deliberately does not serve, at least for now. They are what lets a later stage say no to a request without relitigating scope.
