<!--
TEMPLATE: library-reference (docs/research/libraries/<library>@<version>.md: what one installed version does)
Written by whichever stage read the library's docs (ticket-design, ticket-plan, researcher,
generate-stack-guide), extended by the next one that reads more, per
${CLAUDE_PLUGIN_ROOT}/skills/ticket-design/library-docs.md. One file per library and version: valid
only for that version. Each entry is one question with its answer, so a later stage can reuse the
answer without reading the docs again.
-->

---
kind: library-reference
library: <name as the manifest names it>
version: <the exact version from the lockfile>
---

# <library> <version>

## Entries
### <the question, e.g. "Does `findMany` paginate by default?">
- **Answer:** <what this version does>
- **Example:** <the smallest snippet that shows it, trimmed to the behavior>
- **Source:** <the versioned docs URL, the documentation tool and version asked, or the installed file read>
- **Used by:** <the ticket, plan or decision that relied on it>
