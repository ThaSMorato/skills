<!--
TEMPLATE: context (CONTEXT.md — the glossary / ubiquitous language)
Maintained inline by the domain-model skill as terms resolve. A PURE glossary — canonical terms and
their definitions, NO implementation detail, NO decisions (those are ADRs). Add terms lazily.
CONTEXT.md is the single owner of definitions: other docs USE the terms, they do not redefine them.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` — or `> Needs Input:` when no
value is defensible — per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N).
-->

# Glossary — <project>

> The project's ubiquitous language. One canonical meaning per term. If a term becomes ambiguous, resolve it here.

## Terms
| Term | Definition |
|---|---|
| <Term> | <Canonical meaning — what it is, and what it is not when that's a common confusion> |

## Load-bearing terms
> A term is **load-bearing** when a later stage will *act* on it: it names a requirement, a component,
> an entity, or appears in an acceptance criterion. Those terms get **two descriptions on different
> axes**, so a wrong-but-consistent definition cannot cross the whole pipeline unnoticed. A paraphrase
> is not a second axis — it doubles the cost and detects nothing.
>
> Pick one pair per term from the canonical axes:
> **(a)** by properties × by a concrete example · **(b)** what it is × what it is explicitly not ·
> **(c)** prose × a formal shape (fields, types, cardinality, allowed states).
>
> `/doc-validate` compares the two and reports only the pairs that disagree.

### <Term>
- **Axis:** <a | b | c>
- **First:** <the definition on the first axis>
- **Second:** <the same term on the second axis>

