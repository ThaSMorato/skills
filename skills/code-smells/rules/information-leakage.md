> Part of the `code-smells` skill (see `../SKILL.md`).

# Information Leakage

**Tell:** one design decision — a file format, a protocol detail, a data representation — is embedded in more than one module, so changing it forces edits to every module that knows it.

One of Ousterhout's most important red flags, and the failure of information hiding: each design decision should live in a single module, encapsulated behind a narrow interface. The leak can happen through the interface or "through the back door" — two modules sharing an implicit assumption. It's Shotgun Surgery seen through the lens of *knowledge* rather than edits.

**Fix:** Consolidate the knowledge in one module (make it deeper, hiding the decision behind its interface), or merge modules that share too much knowledge. If two modules exist separately only because of execution order, joining them removes the leak.
