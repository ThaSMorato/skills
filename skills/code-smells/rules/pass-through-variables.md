> Part of the `code-smells` skill (see `../SKILL.md`).

# Pass-Through Variables

**Tell:** a variable is threaded through a long chain of methods only to reach a distant method that actually uses it — every intermediary lists it in its signature without using it.

Each link is made aware of something that's none of its business, and the signature lies about what the method needs. Adding or removing a parameter becomes Shotgun Surgery, and it's a form of Information Leakage.

**Fix:** In order of preference — (1) reuse an object the chain already carries to expose the variable; (2) introduce a single context object that flows through the chain, so a new variable is one field, not N signatures (keep it cohesive, not a junk bag); (3) restructure so the distant method sits closer to the data.
