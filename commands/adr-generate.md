---
description: Write a formal ADR (MADR) from a confirmed Potential ADR.
argument-hint: <potential ADR file or slug>
---

Use the `adr-generator` agent to write a formal ADR into `docs/adr/` from the confirmed Potential ADR: $ARGUMENTS

If no Potential ADR was given, list what's in `docs/adr/potential/` and ask which to formalize. If none exist, tell the user to run `/adr-identify` first.

After the agent returns, show the new ADR's number, title, status, and any relationships set. Then suggest running `/adr-link` to update the graph.
