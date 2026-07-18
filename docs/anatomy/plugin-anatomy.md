# Plugin Anatomy

> How to package skills, commands, and agents into a Claude Code plugin — and **how to choose** between the three. This is the single source for the "by role" decision; the other anatomy specs reference this section.

## Plugin structure

```
<repo>/
├── .claude-plugin/
│   ├── marketplace.json   # the marketplace hosting the plugin(s)
│   └── plugin.json        # plugin metadata + skill list
├── commands/              # user entrypoints (auto-discovered)
├── agents/                # subagents (auto-discovered)
├── skills/                # skills (listed in plugin.json)
├── templates/             # doc skeletons (optional, this flow)
└── docs/                  # authoring/usage guides (not runtime)
```

`commands/` and `agents/` are **auto-discovered** from their directories; `skills/` are **listed explicitly** in `plugin.json → skills` (relative paths to each folder containing a `SKILL.md`).

## Manifests

**`marketplace.json`** — hosts one or more plugins:
```json
{
  "name": "<marketplace>",
  "owner": { "name": "...", "url": "..." },
  "description": "...",
  "plugins": [
    { "name": "<plugin>", "source": "./", "description": "...", "category": "engineering", "keywords": ["..."] }
  ]
}
```
`source: "./"` = single plugin at the repo root (Matt style). For several plugins in one repo, use `source: "./plugins/<name>"` (Wesley style).

**`plugin.json`** — the plugin itself:
```json
{
  "name": "...", "version": "0.1.0", "description": "...",
  "author": { "name": "...", "url": "..." },
  "repository": "...", "license": "MIT", "keywords": ["..."],
  "skills": ["./skills/<cat>/<name>"]
}
```

## Choosing: skill × command × agent (by role)

It's not either/or — each solves a different role. **The decisive insight: a subagent doesn't talk live** (it runs to completion and returns). So anything requiring HITL interaction stays in the main context (skill/command).

| Dimension | Skill | Command | Agent (subagent) |
|---|---|---|---|
| Context | current (main) | main | **isolated**, its own |
| Talks to the user live | **yes** | **yes** | **no** — runs and returns |
| Invocation | model (via `description`) or user | user (`/name`) | delegated by main |
| Parallelism | not on its own | no | **yes** (fan-out) |
| Reuse | primitive reused by skills | thin entrypoint | orchestration worker |
| Context cost | adds to main | adds to main | main stays **clean** |

**Rule of thumb:**
- **Interactive/HITL** (interview, gates, confirmation) → **skill** in main.
- **User entrypoint** → **command** (thin; delegates the heavy work).
- **Reusable technique** (glossary, seams, the 3-Es ADR gate) → **skill primitive** (model-invoked).
- **Heavy and/or parallelizable generation** (docs, code, research) → **agent** (isolated + fan-out).
- **Orchestrating a DAG** → **coordinator command/skill**.

## Distribution
Publish on GitHub → `/plugin marketplace add <owner>/<repo>` → `/plugin install <plugin>@<marketplace>`. Version via `plugin.json → version`.

## See also
[`skill-anatomy.md`](./skill-anatomy.md) · [`command-anatomy.md`](./command-anatomy.md) · [`agent-anatomy.md`](./agent-anatomy.md)
