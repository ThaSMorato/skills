> Part of the `architecture` skill. How to get the numbers that `main-sequence.md`, `sdp-stable-dependencies.md` and `adp-acyclic.md` read.

# Computing the structural metrics

These are **graph arithmetic over imports**, not judgement calls. Where you can compute, do not estimate — a number is comparable across runs and an opinion is not.

## 1. Build the component graph
1. Take the component definitions from `docs/components.md` (or `docs/boundaries.md`'s manifest): each component owns a set of path globs.
2. Extract every import/require/use statement in the repo.
3. Map each import to the component that owns the imported path. Drop intra-component edges and edges to third-party packages — the graph is **between the repo's own components**.

Record the evidence for each edge (`path:line`), because an edge nobody can trace is an edge nobody will act on.

## 2. Per component
| Metric | Formula | Meaning |
|---|---|---|
| `Ca` — afferent coupling | count of components that depend **on** it | how much would break if it changed |
| `Ce` — efferent coupling | count of components it depends on | how exposed it is to others' changes |
| `I` — instability | `Ce / (Ca + Ce)` | `0` = maximally stable, `1` = maximally unstable |
| `A` — abstractness | abstract types / total types in the component | `0` = all concrete, `1` = all abstract |
| `D` — distance | `\|A + I − 1\|` | `0` = on the Main Sequence |

`A` needs the language's notion of "abstract": an interface, an abstract class, a protocol, a trait, a pure type declaration. In a language without them, count the types that have no implementation body. Say which definition you used — an `A` computed by an unstated rule is not comparable to the next run's.

## 3. Cycles
Run a depth-first search over the component graph and report **every** cycle as its full path (`A → B → C → A`), not just its existence. A cycle with no path is not actionable.

## Scope and honesty
- **Declare the extraction method.** Static import parsing misses dynamic loading, dependency injection by string key, and reflection. Those are real edges the graph will not show.
- **Declare what you skipped.** Generated code, vendored directories, and files that failed to parse. A metric computed over 60% of the repo and reported as if it covered all of it is worse than no metric.
- **The graph is an input, not a report.** `/components` uses it for metrics, `/boundaries` for divergence against the contract, and `/decompose` to decide which epics are parallel-safe.
