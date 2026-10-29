> Part of the `ticket-design` skill (see `<plugin root>/agent-references/skills/ticket-design/index.md`). Also read by `ticket-plan`, the `researcher` agent and `generate-stack-guide`: every stage that leans on what a library or framework does.

# A library's docs: the version this repo installs

A library behaves the way its **installed** version does. Advice from memory, or from the docs of the latest release, describes a version the repo may not have: a renamed option, a default that changed, an API added two majors later. The design built on it passes every gate, because every gate compares documents, and fails the first time it runs.

## 1. Find the version
Read it from the lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Gemfile.lock`, `poetry.lock`, `go.sum`, `Cargo.lock`, …), not from the manifest's range: `^5.0.0` says what is allowed, the lockfile says what runs. With no lockfile, say so and use the manifest's lower bound, marked `> Assumed:`.

## 2. Reuse what was already read
Look for `docs/research/libraries/<library>@<version>.md`. If it exists for **this** version, it is the answer to what it covers: use it, and read further only for what it does not cover. A reference for another version is not this one's; read it only to know what to check.

## 3. Read the docs of that version
In order of preference:
- **A documentation tool that takes a version**, when one is available (Context7 through `ToolSearch`, for instance), asked for the exact version;
- **the package's own files as installed**: its README, its docs folder and its type definitions or source under the dependency directory (`node_modules/<library>/`, the gem's path from `bundle info`, the module cache);
- **the official docs for that version**, when the site keeps versioned pages.

A behavior you could not find in any of these is not grounded: say what you searched.

## 4. Keep what you read
Write or extend `docs/research/libraries/<library>@<version>.md` from `<plugin root>/agent-references/templates/library-reference.md`: what you looked up, the answer, the example that shows it, where it came from, and the decision or ticket it served. The next ticket on the same version reads it instead of searching again. When the lockfile moves the library to another version, the old file stays as the record of that version; a new one starts.
