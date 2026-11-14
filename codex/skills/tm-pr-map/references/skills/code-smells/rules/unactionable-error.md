> Part of the `code-smells` skill (see `../SKILL.md`).

# Unactionable Error

**Tell:** an error that reaches a person (an end user, or the developer calling your API or CLI) in the implementation's words, or with no next step. The shapes:

| Shape | What it looks like |
|---|---|
| **Implementation vocabulary** | `constraint fk_order_cart violated`, `NoneType has no attribute id`, a printer's `PC LOAD LETTER` (paper cassette, load letter-size paper) |
| **Generic at the edge** | the boundary catches everything and says "Something went wrong" or "Invalid request", dropping the cause |
| **Which input, not what for** | "invalid channel" without the operation, the value received, or why it is invalid |
| **No way forward** | the message says what failed and stops, when the caller could have retried, fixed one field or asked someone |
| **One code for every category** | the caller's code has to parse the text to tell a bad argument from an outage |

**Why it hurts:** in many products the error message is the interface users see most and the one designed least. A user who cannot tell what happened, or what to do next, stops; a developer upstream who cannot tell one error from another cannot serve their own users. Nobody should need to understand your implementation to understand your error.

## The message answers two questions, in the product's terms
1. **What exactly happened?** The operation being attempted, with what (the resource, the value received), and why it failed.
2. **What can I do now?** The next step, or the alternatives. A chat API that rejects `@deploys` as an unknown channel says that `@` is the prefix for users, that channels start with `#`, and asks: *did you mean `#deploys`?*

## The category says who acts, and when
| Category | Example | Who acts | When it can be fixed |
|---|---|---|---|
| **System** | the payment provider is down; a timeout | nobody on the user's side; maybe a retry | at run time (retry) or by your team |
| **Assertion** | "this can never be null" | your team | in development: it is a bug, and the end user never has to act on it |
| **Developer's invalid argument** | an integer where a string was expected; an id that does not exist | the developer who integrated | in development, before a user meets it |
| **User's invalid argument** | a mistyped card number | the end user | at run time, by fixing the input |
| **Unmet precondition** | no permission; not logged in; the cart expired | the user, **or another persona** (an admin) | at run time, by changing the state |

The same precondition needs a different message per persona: the member is told to ask a workspace admin; the admin is told where to turn the permission on.

## Where it is raised
The edge (the API handler, the CLI command, the UI component that started the action) knows **what the user wanted**; the deep code knows **what actually failed**. Write the message where the two meet: validate what is cheap and obvious at the edge, before running anything, and translate what only the core can detect, keeping the original as the cause (`cause`, `%w`, `raise ... from`) so the log still has it.

**Fix:** name the operation, the value and the reason; give the next step; return a distinct type or code per category, with structured metadata, so the caller's code can branch without reading the text. If the error should not reach a person at all (an assertion), make sure it reaches your team instead.

**Severity:** an unactionable error on a path where the user cannot proceed without help (checkout, sign-up, a deploy) is a defect; report it `high`. Elsewhere it is `medium`.
