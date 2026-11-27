> Part of the `asking` skill (see `SKILL.md`). Read when writing a `> Needs Input`, `> Assumed` or `> Decided` marker, or judging whether a value is an assumption. Its sections keep the numbers other documents cite them by.

## 4. Make the default visible: as a marker, not a sentence

When you are proceeding under an assumption rather than blocking, say what you assumed **and what would change if it were wrong**. "Assuming the ledger is append-only; if it isn't, `SI-3` needs a different seam" lets the user correct you in one word. An unstated assumption gets discovered three stages later, which is where this whole suite's expensive mistakes live.

In a document, that sentence is a **marker**, because a marker is something a validator can find and a sentence is not. There are three, and each carries the value, where it came from, and what breaks if it is wrong. Each is written as a **callout**: a first line that GitHub and Obsidian both render as a colored box, then the marker line, unchanged, which is what validators search for:

| Marker (after its callout line) | Means | At the gate |
|---|---|---|
| `> [!CAUTION]` then `> Needs Input: <what> — <why no default is defensible>` | there is no value you can defend; what is written is a placeholder | **blocks**: the document is not approvable until it is answered |
| `> [!WARNING]` then `> Assumed: <value> — <no source: what you looked at>. If <other value>, <what changes>.` | you chose a value the sources do not give, and you can defend it | **listed**: the user confirms or corrects, but it does not block |
| `> [!NOTE]` then `> Decided: <value> — <who>, <YYYY-MM-DD>` | an `Assumed` the user confirmed or corrected, or a value the owner supplied (their request, an image, a document: `owner (task.md)`) | a **source**: cite it like any other |

```
> [!WARNING]
> Assumed: retention is 90 days — neither the brief nor the PRD states one.
> If it is 30, the partitioning in SI-2 changes.
```

Every line of the marker starts with `> `, so the box holds all of it. A marker written before 0.7.0 has no callout line; it is still a marker, and `$thasmorato-skills:tm-docs-migrate` adds the line.

Pick between the first two by the ceiling below: if a wrong value would change a contract, a schema or a boundary **and** nothing makes one value more defensible than another, it is `Needs Input`. Otherwise it is `Assumed`.

## 6. Recognise an assumption by what it is about, not by how sure you feel

Deriving a value and completing one read the same: same fluency, same confidence, same shape of sentence. Asking yourself *"am I inferring here?"* does not help, because the answer is generated the same way the value was. What does help is the **category**: some questions the repository and the upstream documents can never answer, and a value in one of these classes with no citable source is an assumption, however obvious it feels.

| Class | Example |
|---|---|
| Business threshold or policy | retention, rounding, what counts as "overdue" |
| Priority between goods that conflict | consistency vs latency, cost vs coverage |
| Authority and visibility | who may see or do what |
| Semantics of an external contract | what the third party guarantees, not what its docs say |
| Failure tolerance | what is acceptable when a dependency is down |
| A name that carries domain meaning | the ubiquitous language |
| Future intent | will this change? Which decides what is volatile, and so what is a detail |

These are the other half of §3. A **fact** (does this already exist, what does this function return) is yours to find, and not finding it is a grounding failure (`GR-N`), never an assumption to mark. A **decision** in one of these classes is what gets marked.

**The ceiling matters as much as the floor.** Mark a value only when a different answer would change the artifact: a contract, a schema, a boundary, a slice. A detector that fires on everything becomes an interrogation, and a user who is asked about everything stops reading the questions. If swapping the assumption changes nothing downstream, write the value and move on.
