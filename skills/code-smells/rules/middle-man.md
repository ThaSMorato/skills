> Part of the `code-smells` skill (see `../SKILL.md`).

# Middle Man

**Tell:** most of a class's methods just forward the call to another object, adding nothing — you navigate an intermediary that only says "ask them."

The indirection exists but doesn't pay its own cost.

**Fix:** Remove Middle Man — talk directly to the delegate where the bridge does nothing. Caution: not all delegation is a smell. Encapsulating, adapting an API, or hiding a delegate to protect the client is good design; the smell is *empty* delegation. The opposite extreme (exposing everything) is Inappropriate Intimacy — the balance is the point.
