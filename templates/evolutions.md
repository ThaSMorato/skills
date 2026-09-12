<!--
TEMPLATE: evolutions (the overflow log)
Append-only. Two writers: the decomposer, for a finding that traces to neither the PRD nor an ADR,
and /retro, for what the work taught about the PRODUCT. Read when scope is next revisited.

This is a LOG, not a state file: entries are never edited or removed, and nothing derives current
state from it. If an entry becomes a requirement, it stays here and gains a pointer to where it went.
Every entry cites the artifact it came from — an entry nobody can trace is an entry nobody will act on.
-->

# Evolutions — <product>

> Findings worth keeping that are not requirements. Each one either becomes a requirement later, or
> stays here as the record of something considered and not pursued. Both outcomes are useful; losing
> the finding is not.

## Entries

### EV-1 — <one-line finding>
- **Found by:** <the artifact: `.scratch/<slug>/plans/<NN>/progress.md`, a review file, `/decompose` run, …>
- **Kind:** capability | constraint | defect | opportunity
- **What it is:** <one or two lines, stated as what was observed — not as a proposal>
- **Why it isn't a requirement (yet):** <traces to no RF/RNF · out of the current scope · needs a decision>
- **Became:** <RF-0NN, or an ADR id, or `nothing yet`>
