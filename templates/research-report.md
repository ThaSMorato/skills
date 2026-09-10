<!--
TEMPLATE: research-report
Filled by the researcher agent (AFK). A cited investigation that feeds the HLD/FDD. Every claim traces
to a PRIMARY source. PRUNE optional sections that don't apply; (required) sections always stay.
-->

# Research — <question, short>

## Metadata (required)
- **Question:** <the exact question investigated>
- **Date:** <YYYY-MM-DD>
- **Applies to:** <the exact versions/releases the findings hold for, e.g. "React 19.1, Next 15.3">
- **Scope:** <what was in/out of scope for this investigation>

> **Applies to** is what dates this report, not `Date`. "Researched in March" says nothing about
> whether the answer still holds; "applies to React 18" says exactly when it stops holding.

## Findings (required)
> Each finding is a claim with its source. **Primary sources** — official docs, source code, specs,
> first-party APIs — are required for any claim of fact; follow the claim back to the source that owns
> it. **Secondary sources** are allowed for what no spec can tell you (production experience,
> comparisons, benchmarks, failure reports) and are **labelled as such**, so a reader can weigh them.
- <finding> — [source](url-or-path) *(primary)*
- <finding> — [source](url-or-path) *(secondary — experience report)*

## Conflicts (optional)
> Where two sources disagree — the classic case being a spec against a real implementation. A conflict
> is a **finding**, not something to resolve silently by picking one. State both positions, both
> sources, and what would settle it.

| Claim | Source A says | Source B says | What would settle it |
|---|---|---|---|

## Synthesis (required)
> What the findings mean together — the answer to the question, and the trade-offs that surfaced.

## Implications for design (optional)
> How this informs the HLD/FDD: constraints, viable options, recommended defaults, risks.

## Open questions / Needs Input (optional)
> What remains unresolved or needs a human decision.

## Sources (required)
> The primary sources consulted, listed.
