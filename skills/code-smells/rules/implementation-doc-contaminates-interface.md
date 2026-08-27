> Part of the `code-smells` skill (see `../SKILL.md`).

# Implementation Documentation Contaminates Interface

**Tell:** an interface comment (what a *user* of the abstraction needs) mixes in details of how it works internally — a public method's doc describes the private algorithm or data structure, "first it does X then Y."

Anyone who just wants to call the method is forced to read implementation that doesn't concern them. A form of Information Leakage through documentation; the tell is that changing the implementation forces rewriting the interface comment — they're coupled.

**Fix:** Separate the two kinds of documentation. Interface comment = the contract (what it does, args, return, effects, pre/post-conditions) — abstract and stable. Implementation comment = how it works, next to the internal code. The user reads only the first.
