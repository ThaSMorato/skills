> Part of the `code-smells` skill (see `../SKILL.md`).

# Apparent Modularization

**Tell:** a module was extracted, and the folder moved while the authority did not. The signs:
- the module's service does not inject its own repository: it writes through the connection or entity manager its caller passed in;
- it receives values the caller already derived (the slug computed, the nickname resolved) instead of the intent ("create the channel for this user");
- the rule of the module's own domain (derive, validate, resolve a collision) still lives in the caller or a helper of it;
- its tests build it with `new` and no repository or database, and pass, which hides that it does nothing alone;
- **the deletion test:** deleting the module and putting its code back in the caller changes almost nothing, because it hid no decision.

**Why it hurts:** it is Information Leakage, a Shallow Module and Feature Envy at module scale at once, with false confidence on top: the folder tree announces a boundary the code does not keep, and whoever reads the structure (an agent included) concludes wrongly where the rule lives.

**Fix:** move the authority, not the file. The owning module holds its entity, its rules and its repository, and exposes the intent (`createChannelFor(user)`); the caller only asks. The transaction is a separate question: it belongs to the use case, which opens it and lets each module take part through its own repository. Receiving the transactional context is not the smell; using it as a substitute for the module's own repository and rules is. A request to fix it names what the module must control, not only where it lives.
