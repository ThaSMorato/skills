> Part of the `code-smells` skill (see `../SKILL.md`).

# Special-General Mixture

**Tell:** a general-purpose mechanism also carries code specialized for one specific use of it — a generic class/method with an `if (special case for client X)` baked in.

The special contaminates the general: it's harder to reuse (it drags baggage) and creates Information Leakage between the two layers. Classic example: a generic text-editor `insert` that already handles backspace/newline — behavior that belongs a layer up.

**Fix:** Separate the layers. Pull the special-case code into a higher layer that *uses* the general mechanism, and keep the general mechanism unaware of specific cases — it exposes clean primitives, and whoever has the special case composes them.
