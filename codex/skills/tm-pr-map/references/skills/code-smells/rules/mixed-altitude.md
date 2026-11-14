> Part of the `code-smells` skill (see `../SKILL.md`).

# Mixed Altitude

**Tell:** a function's body reads at more than one level of abstraction. Tag each line:

| Band | What lives there | Example |
|---|---|---|
| **Intent** | the decision, the guard, the named steps of the algorithm | `if (crossedLimit) reanchor() else keep()` |
| **Domain operations** | calls named in the domain's verbs | `renumberFocusSet(set)`, `buildInvoiceLines(order)` |
| **Mechanics** | the language and runtime doing the work | `rows.map(r => …).flat().map(…)`, date formatting, an SQL string, index arithmetic, casts |

The function is fine when **every line is in the same band**. The smell is a mechanics block in the middle of domain calls: the reader has to drop from "what" to "how" and climb back, and the name of the step the block performs is nowhere in the code.

**Fix:** extract the mechanics block into a leaf **named for what it does** (`toInvoiceDtos(rows)`), so the caller reads in one band. The name matters more than the extraction: it is the missing word.

**Counterweight:** extract only a block that is in a **different** band from its neighbors. Pulling out lines that are already at the caller's altitude adds a layer and removes nothing: that is `lazy-class.md` and `pass-through-methods.md`, not a fix.

**Separate from duplication.** Removing a duplicated block does not make its caller single-band, and a single-band function can still duplicate another. Check both; passing one says nothing about the other.
