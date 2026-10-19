---
description: Write a formal ADR (MADR) from a confirmed Potential ADR.
argument-hint: "<potential ADR file or slug>"
---

Delegate to subagent `adr-generator` to write a formal ADR into `docs/adr/` from the confirmed Potential ADR: $ARGUMENTS

For an ad hoc decision such as "adopt X", first inspect existing ADRs and classify new, amends, or supersedes. Record the confirmed decision evidence without file/class prescriptions, then pass it to adr-generator in this same stage; a separate analysis stage is not required. If there is neither an ad hoc decision nor a Potential ADR, list what's in `docs/adr/potential/` **whose `state` is `proposed`** and ask which to formalize. If none are pending, tell the user to run `/tm-adr-identify` first.

After the agent returns, show the new ADR's number, title, status, and any relationships set, and confirm the Potential was marked `formalized`. Then suggest running `/tm-adr-link` to update the graph.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
