> Part of the `architecture` skill. Component cohesion.

# REP — Reuse/Release Equivalence Principle

**The granule of reuse is the granule of release.**

Nobody can reuse code they cannot depend on a *version* of. A component is reusable only if it is released — tracked, versioned, and given release notes — because a consumer needs to know whether an upgrade is safe before taking it.

## The tell
- Consumers vendor a copy, pin a commit SHA, or reach into a sibling directory instead of depending on a published unit.
- Classes are grouped by what a reader thought was "related" rather than by what ships together.
- A release note cannot be written for the component because its contents have no single reason to be released.

## What to do
Group classes into a component only if they are **releasable together and reusable together**. The component's public surface is a promise; versioning is how that promise is communicated. If two halves of a component would sensibly get different version numbers, they are two components.

## The caveat
REP is the principle that pushes components to be **larger** — everything a consumer needs, in one release. It fights CRP, which pushes them smaller. See `cohesion-tension.md`; do not apply REP alone.
