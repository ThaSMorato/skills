> Part of the `code-smells` skill (see `../SKILL.md`).

# Unenforced Invariant

**Tell:** a rule the domain depends on is stated somewhere — a comment, a doc, a validation in one caller — but the type lets it be broken. A `status: string` that must be one of four values; an `Order` that must have at least one line but can be built empty; a `start`/`end` pair where nothing prevents `end < start`; a setter that lets any caller put the object into a state the rest of the code assumes impossible.

**Why it hurts:** an invariant checked by callers is checked by the callers someone remembered. Every new caller is a new chance to break it, and the code that relies on it fails far from the place that broke it.

**Fix:** move the rule into the type, so an invalid value cannot be constructed: an enum or union instead of the string, a constructor or factory that validates and refuses, no public setter for fields that must change together, a value object for the pair. Then delete the scattered checks. Related: `primitive-obsession.md` (the raw type is often why the rule has nowhere to live).
