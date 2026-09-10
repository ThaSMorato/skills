> Part of the `architecture` skill. Component coupling. Depends on `metrics.md` for how to compute.

# The Main Sequence, and the two bad zones

SDP and SAP together describe a line. Plot every component with **instability `I`** on the x-axis and **abstractness `A`** on the y-axis, and the good positions fall along the line from `(0, 1)` to `(1, 0)`: maximally stable and abstract, or maximally unstable and concrete. That line is the **Main Sequence**.

**`D = |A + I − 1|`** is the distance from it: `0` is on the line, `1` is as far off as possible.

```
A  1 |*                          (0,1) stable + abstract
      |   *
      |      *   Main Sequence
      |         *
      |            *
   0 |_______________*           (1,0) unstable + concrete
      0                1   I
```

## The two zones off the line

**Zone of Pain — low `A`, low `I` (bottom-left).** Stable and concrete. Everything depends on it and it cannot be extended without being edited, so every change is expensive and wide. A database schema and a framework's core types live here — and that is tolerable *for things that genuinely do not change*. It is only pain when the thing is volatile.

**Zone of Uselessness — high `A`, high `I` (top-right).** Abstract and depended on by nothing. Interfaces nobody implements, layers nobody calls. Dead abstraction: the cost of indirection with none of the benefit.

## How to use it
`D` is a **screening tool**, not a verdict. Rank components by `D`, look at the worst few, and ask whether that position is deliberate. A stable-and-concrete component holding an unchanging value type is fine at `D = 1`; the same position for the pricing engine is the finding.

It is also the suite's most natural fitness function: `D` per component and the cycle count are two numbers a build can track over time, and a rising trend is a signal no review of an individual diff can produce.
