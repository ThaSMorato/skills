> Part of the `architecture` skill. Architecture.

# The level graph — what "high level" means

**Level is distance from the inputs and outputs.** The further a piece of code is from I/O, the higher its level. It is not seniority, importance, or how abstract the name sounds — it is a position in a graph, and it is what the Dependency Rule sorts by.

## The classic mistake
A program reads characters from input and writes them to output. Written naively, the top-level function calls `read` and `write` directly — so the **highest-level** component in the program depends on the two **lowest-level** ones. The structure inverts under the smallest requirement change ("read from a file instead"), because the policy is welded to the mechanism.

The fix is not to move the code but to flip the arrows: the policy declares what it needs (`CharSource`, `CharSink`), and the concrete input and output implement them.

## How to read a level graph
Draw the flow of data — that is *not* the dependency graph. Then check whether the source-code dependencies follow the flow or oppose it. Where they follow it, high-level policy is chained to low-level detail. Where they oppose it, an interface has been inserted and the policy is protected.

## Why it matters here
"Which component is higher level?" is the question `docs/boundaries.md` answers with its `level` field, and the answer is what makes the allow-list checkable: an edge from a lower level to a higher one is legal, the reverse is not.

## The tell
- A top-level orchestrator importing a driver, a client, a formatter.
- Policy functions whose signatures mention transport, storage, or presentation types.
- Everything at "the same level" — a flat graph usually means levels were never assigned, not that they are genuinely equal.
