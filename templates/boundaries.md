<!--
TEMPLATE: boundaries (the boundary contract)
Filled by the boundary-architect agent AFTER the FDDs — only then are the real axes of change known.
This is the Dependency Rule made concrete FOR THIS REPO: which edges are allowed, what is policy and
what is detail, and where variation is deferred behind a plug point.
It is deliberately OVERLOADED: prose says the rule, the manifest block says the same rule as a graph.
Two representations of one intent means a contradiction is machine-detectable. Keep them in sync —
if they disagree, that IS the finding.
PRUNE + RENUMBER optional sections that don't apply; (required) sections always stay.
-->

# Boundary contract — <system>

## Metadata (required)
- **Status:** draft | in review | approved
- **Sources:** <components.md, fdd/*.md, hld.md, adr/*.md>

## Layering (required)
> The components ordered by level: higher level = closer to business policy, further from I/O. The
> Dependency Rule follows from this order — source-code dependencies point **inward/upward only**,
> toward policy, never from policy toward detail.

| Level | Components | Why this level |
|---|---|---|
| 3 — policy | | |
| 2 — application | | |
| 1 — adapters | | |
| 0 — detail | | |

## Policy vs detail (required)
> Which components hold business policy and which are detail — the database, the web delivery
> mechanism, the framework, the third parties. A detail is something the policy must be able to
> outlive. Name each detail and the abstraction that keeps it replaceable.

| Detail | Kept behind | Consequence if it leaked |
|---|---|---|

## Allowed edges (required)
> Every dependency edge that is permitted, in prose, with its reason. Anything not listed is
> forbidden — this is a whitelist, and that is what makes it checkable.

| From | To | Why it is allowed |
|---|---|---|

## Inversions (required)
> Every place where the natural call direction and the allowed dependency direction disagree, and the
> abstraction that flips it. Each inversion is an ADR candidate — flag it, do not write the ADR here.

| Call goes | Dependency points | Abstraction that inverts it | ADR |
|---|---|---|---|

## Plug points (optional)
> Where variation is deliberately deferred: the extension point, who may register into it, and what
> the host is forbidden to know about the plugin.

## Manifest (required)
> The same contract as a graph, for mechanical checking. Component names must match
> `docs/components.md` exactly. `allow` is exhaustive — an edge absent from it is a violation.

```yaml
components:
  - name: <component>
    level: <0-3>
    kind: policy | detail
    paths: ["<glob the component owns>"]
allow:
  - from: <component>
    to: <component>
deferred:
  - point: <plug point name>
    host: <component>
    implementors: ["<component>"]
```

## Divergence from the code (optional — brownfield)
> Edges that exist today and are **not** in `allow`, from the import graph. Each is either a violation
> to fix or a rule to amend — say which, and never leave it unclassified.

| From | To | Evidence | Verdict (fix \| amend) |
|---|---|---|---|

## Open questions / Needs Input (optional)
