> Part of the `code-smells` skill (see `../SKILL.md`).

# Hard to Describe

**Tell:** the comment describing a method or variable has to be long and complicated — full of "except when," "unless," "in the cases where."

A good abstraction is simple to describe; when the description becomes a paragraph of caveats, the problem is the *entity*, not the text. You can't say what the function does in one simple sentence (the "and" shows up again), which means the interface is a shallow abstraction leaking complexity to its users.

**Fix:** Simplify the abstraction, not the description — split responsibilities, eliminate special cases (sometimes by defining the error out of existence), make the module deeper. Travels with Hard to Pick Name: hard to describe is usually hard to name, both pointing at the same murky design.
