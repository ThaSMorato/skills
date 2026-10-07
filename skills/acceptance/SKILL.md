---
name: acceptance
description: 'Check every acceptance criterion and every part of the owner''s request against the running software before the work is called done: each one verified in the browser (with a screenshot), by a named test only, or not verified with the reason, recorded in one index the pull request reads. Use after the last /review fix and /tidy, before /walkthrough and /pr, or on "test it in the browser / were all the ACs checked".'
disable-model-invocation: true
---

Green tests say the code does what the tests ask. The owner asks something else: does the feature do what was requested, on screen, with real data. This stage answers that, item by item, after the last change to production code, and leaves a record nobody has to take on trust.

## 1. List what was asked
Read, and number every item:
- the owner's request, from `.scratch/<feature-slug>/request-trace.md` when it exists (every row marked `covered`), or else the request itself (`task.md`, the brief, the message that started the work);
- every acceptance criterion of the ticket, by id;
- the plan's **Not verified** list in `progress.md`.

An item in the request and in an AC is one item: write it once, with both references.

**Done when** each item has a number, its words quoted from the source, and where it came from.

## 2. Find the means
A check needs a way to see the software run. Find it before concluding there is none:
- **A browser tool.** Search the available tools for one (`ToolSearch` with "playwright" or "browser", or the MCP servers listed). A missing tool is a reason only after this search.
- **A running server.** Read the dev command and port from `docs/guidelines.md`, the stack guide or the scripts (`package.json`, `Procfile`, `bin/`), and check the port. When a navigation fails, try once more before deciding the server is down. When it is down, ask the owner to start it with the command you found and wait; starting a long watcher yourself competes with theirs.
- **Real data.** Use the data the environment already has (the local database, the seeds, a fixture the project's testing guide names) before mocking an integration. When nothing real exists for an item, ask the owner for a sample; a mock is the last resort, and the index says so at the top.

**Done when** the browser tool, the server and the data source are named, or each missing one is named with what was searched.

## 3. Check each item
For each item, one verdict:
- **browser**: performed in the running software. Save a screenshot to `.scratch/<feature-slug>/acceptance/<NN>-<slug>/<item>.png` and say what it shows.
- **test**: no screen shows it (a rule deep in a service, an error path the UI cannot reach), and a test covers it: name the test, `file:line`.
- **not verified**: neither was possible. Say why, and what would verify it.

A visual item (layout, copy, a state the user sees) is **browser** or **not verified**; a test does not see the screen. An item that fails is a defect: report it and stop, and the fix goes back through `/implement`'s loop before this stage runs again.

**Done when** every item has a verdict, every browser verdict has its screenshot, and every failure is reported.

## Output
Write `.scratch/<feature-slug>/acceptance/<NN>-<slug>.md`:

```markdown
---
kind: acceptance
plugin_version: <the "version" in ${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json>
slug: <NN>-<slug>
verified_at: <the commit checked, git rev-parse HEAD>
items: <count>
by_verdict: {browser: <n>, test: <n>, not_verified: <n>}
failed: <count>
mocked: <true | false>
---

# Acceptance: <NN> <Ticket title>

| # | Item (quoted) | Source | Verdict | Evidence |
|---|---|---|---|---|
| 1 | "<words>" | request · AC-2 | browser | `<item>.png`: <what it shows> |
```

**The record is valid at `verified_at` only.** Any later change to production code (a review fix, a tidying) makes it stale: `/pr` and `/flow` compare `verified_at` with `HEAD` and ask for a re-run when non-test files changed in between.

## Gate
Report the counts, every failure and every **not verified** item resolved to its words. The work is done when nothing failed and the owner has read the **not verified** list; until then, say what is missing instead of "done". Next: `/walkthrough` or `/pr`.
