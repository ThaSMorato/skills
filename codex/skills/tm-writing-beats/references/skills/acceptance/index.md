---
name: acceptance
description: 'Check every acceptance criterion and every part of the owner''s request against the running software before the work is called done: each one checked by an agent that did not write the code: in the browser on the real controls (with a screenshot), by an HTTP request, by a command, by a measurement, by a named test only, or not verified with the reason, recorded in one index the pull request reads. Use after the last $thasmorato-skills:tm-review fix and $thasmorato-skills:tm-tidy, before $thasmorato-skills:tm-walkthrough and $thasmorato-skills:tm-pr, or on "test it in the browser / were all the ACs checked".'
disable-model-invocation: true
user-invocable: false
---

Green tests say the code does what the tests ask. The owner asks something else: does the feature do what was requested, on screen, with real data. This stage answers that, item by item, after the last change to production code, and leaves a record nobody has to take on trust.

## 1. List what was asked
Read, and number every item:
- the owner's request, from `.scratch/<feature-slug>/request-trace.md` when it exists (every row marked `covered`), or else the request itself (`task.md`, the brief, the message that started the work);
- every acceptance criterion of the ticket, by id;
- the plan's **Not verified** list in `progress.md`;
- the plan's **Verification prerequisites**: each one the checks need, to confirm it exists before checking;
- when the ticket builds a screen with a spec in `docs/features/<feature>/ui/<screen>.md`: each state and each width it lists, checked against its capture;
- when this ticket delivers the last requirement a **guiding scenario** in `docs/product/prd.md` was waiting on (every requirement on its steps is now built): **the whole scenario**, as one item, walked from its first step to the persona's goal (`references/skills/interview/scenarios.md`). Separate checks can each pass on a path no user can walk.

An item in the request and in an AC is one item: write it once, with both references. An item that enumerates variants ("in CSV and in JSON", "for admins and for members") is one item per variant: a check that passes for one says nothing of the other.

**When this is the last ticket of the story** (no other ticket in `.scratch/<feature-slug>/issues/` is still open), every row of the request trace marked `covered` is an item here, whichever ticket covered it: this is the one run that sees the whole request, and `$thasmorato-skills:tm-pr` comes after it.

An item that can only be checked after another one passes (the edit after the create, the export after the import) carries **Depends on:** `<n>`. An item the owner defers is not dropped: it goes to `.scratch/<feature-slug>/follow-ups.md`, one line linking back to its number here.

**Done when** each item has a number, its words quoted from the source, and where it came from.

## 2. Find the means
A check needs a way to see the software run. Find it before concluding there is none:
- **The migrations and the server first.** A pending migration or a server that is down fails every item that touches them, and says nothing about the feature. Check both before anything else.
- **A browser tool,** when any item needs a screen. Search the available tools for one (`ToolSearch` with "playwright" or "browser", or the MCP servers listed). A missing tool is a reason only after this search.
- **The repo's own recipe.** Search the project's skills, stack guides and testing guide for how this project captures a screen, logs in a test account or seeds a state, and follow it before improvising one.
- **A running server.** Read the dev command and port from `docs/guidelines.md`, the stack guide or the scripts (`package.json`, `Procfile`, `bin/`), and check the port. When a navigation fails, try once more before deciding the server is down. When it is down and `progress.md`'s `## Workspace` lets this run start a server, start it once, for this run; otherwise ask the owner to start it with the command you found and wait: a long watcher you start competes with theirs.
- **Real data.** Use the data the environment already has (the local database, the seeds, a fixture the project's testing guide names) before mocking an integration. When nothing real exists for an item, ask the owner for a sample; a mock is the last resort, and the index says so at the top.

**An obstacle you can remove locally is a means, never a verdict.** A feature flag that is off, a pending migration, a missing seed, a stopped worker, a server this run may start, a page that loads a local file only over `http://`: provide it, write it under `## Means provided` in the record (what, how, and how it was put back), and put it back when the checks end. `not verified` is for what the environment cannot provide, not for what nobody set up.

**Done when** the browser tool, the server and the data source are named, or each missing one is named with what was searched.

## 3. Check each item
The checks run in a context that did not write the code: call the `spawn_agent` tool with `agent_type = "tm-acceptance-checker"`, passing the numbered items (with their `Depends on:`), the means from step 2 and the evidence folder `.scratch/<feature-slug>/acceptance/<NN>-<slug>/`. It returns one verdict per item, with its evidence and its Check; this stage writes the record from what it returns.

Each item gets one verdict, the strongest its means allow:
- **browser**: performed with an interactive browser tool on the real controls (navigating, clicking, typing as a user would). A script that only opens a URL and takes a picture is not a browser check. Save a screenshot to `<item>.png` in the evidence folder and say what it shows.
- **http**: an API with no screen. The request goes as a block in `requests.http` in the evidence folder (method, URL, headers without secrets, body), so anyone can send it again; the response goes to `<item>.response.txt`. The evidence names the block, the status and the field that answers the item.
- **run**: a job, a CLI, a worker, a script with no screen: the command and its output, saved to `<item>.out.txt`. A ticket with no screen gets at least one real local run of what it built, not only its tests.
- **test**: nothing above reaches it (a rule deep in a service, an error path no input can trigger), and a test covers it: name the test, `file:line`.
- **measured**: a non-functional requirement (latency, throughput, size, a rate): the output of a load test, a log, a metric or a trace, with the requirement's threshold and the value measured, saved to `<item>.measure.txt`.
- **not verified**: none was possible. Say why, and what would verify it.
- **blocked**: a prerequisite the plan declares (`## Verification prerequisites`) is missing, or the item it **Depends on** failed or was blocked. Name the prerequisite and the SI that was to produce it, or the item; nothing about this item was learned, so it is neither a pass nor a failure.

**Every browser verdict says what was checked beyond the picture.** Its Check is `mechanical: <what>` when something was compared (the URL, the DOM text, a count, a request seen, a database row, the checks in `references/skills/acceptance/visual-checks.md`), or `capture only` when the verdict rests on reading the screenshot alone; a `capture only` is marked ⚠️ in the record. Anything an item says the user sees gets the visual checks: an element that satisfies the AC's words in the DOM but that the user cannot see (not loaded, off the viewport, clipped, covered) **fails**, and the gate proposes amending the AC to say it must be visible.

**A result that shows up somewhere else is checked there.** An item whose outcome is an email, a file, a notification or another screen gets a capture of that surface, not of the screen that triggered it.

Walk a whole-scenario item **as its persona**: with only what they would know, through the way they would find the feature, never by typing a URL only the team knows. Write down every point where you hesitated, searched, read a message twice or took a step the scenario did not have: that is **friction**. Friction is not a failure (the persona got there) and goes in its own section, with a screenshot and the step it happened on, for the owner to judge.

A visual item (layout, copy, a state the user sees) is **browser** or **not verified**; a test does not see the screen. An item that fails is a defect: report it and stop, and the fix goes back through `$thasmorato-skills:tm-implement`'s loop before this stage runs again.

**`mocked`** is `true` when any verdict rests on a mocked integration or on data made up for the check instead of the environment's own; the record names which items at the top.

**Done when** every item has a verdict, every browser verdict has its screenshot and its Check, every http, run and measured verdict has its saved output, and every failure is reported.

## Exploratory pass (optional)
With every item checked and the browser at hand, offer one pass that wanders the screens the ticket touched as its persona would: other paths to the same place, odd inputs, the back button, a narrow window. It changes no verdict. Each thing worth a look goes under `## Suggested cases` with its screenshot and the step that led there, as a candidate criterion or test for the owner to accept or drop; nothing is added to the ticket here.

## Output
Write `.scratch/<feature-slug>/acceptance/<NN>-<slug>.md`:

```markdown
---
kind: acceptance
plugin_version: 0.7.0
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
instructions: [<every value the project instructions already in your context ask this field to list, exactly as written; [] when none does; never open a file to find one>]
slug: <NN>-<slug>
verified_at: <the commit checked, git rev-parse HEAD>
items: <count>
by_verdict: {browser: <n>, http: <n>, run: <n>, test: <n>, measured: <n>, not_verified: <n>, blocked: <n>}
failed: <count>
friction: <count of friction notes>
mocked: <true | false (see section 3)>
capture_only: <count of browser verdicts with no mechanical check>
---

# Acceptance: <NN> <Ticket title>

| # | Item (quoted) | Source | Verdict | Check | Evidence |
|---|---|---|---|---|---|
| 1 | "<words>" | request · AC-2 | browser | mechanical: the row count is 3 | `<item>.png`: <what it shows> |
| 2 | GS-1: "<the outcome>" | prd · GS-1 | browser | ⚠️ capture only | `gs-1-<step>.png` per step |
| 3 | "<words>" | AC-3 | http | mechanical: status 201, `id` present | `requests.http` block 3, `3.response.txt` |

## Means provided
| What | How | Put back |
|---|---|---|
| the `exports` flag | `FEATURE_EXPORTS=1` in `.env.local`, read by the server at start | removed, server restarted |

## Friction
| Scenario step | What happened | Evidence |
|---|---|---|
| GS-1.3 | looked for the export under Reports; it is under Settings | `gs-1-3.png` |

## Suggested cases
- <from the exploratory pass, when it ran: what was seen, the step, the screenshot>
```

**The record is valid at `verified_at` only.** Any later change to production code (a review fix, a tidying) makes it stale: `$thasmorato-skills:tm-pr` and `$thasmorato-skills:tm-flow` compare `verified_at` with `HEAD` and ask for a re-run when files outside the tests and `docs/` changed in between. A change to the documents alone (the absorption below) changes nothing the record checked.

## 4. Absorb the delivered criteria
With every item passed, follow `references/skills/acceptance/absorb.md`: each feature criterion this ticket finished delivering becomes a rule in the feature's `fdd.md` (or leaves, when a flow or contract there already says it), and is marked in `.scratch/<effort>/criteria/<feature>.md`. With any failure, skip this step: nothing was delivered.

**Done when** every criterion this ticket's ACs trace to is `absorbed` or `delivered, waiting on` its other tickets.

## Gate
Open the report with one line per acceptance criterion, as the `asking` skill's §7 table (AC, state, blocked by). Then report the counts, every failure, every **not verified** item resolved to its words, the `capture only` verdicts, the means provided and whether each was put back, the friction notes, the suggested cases, any AC to amend because what it names is not visible, and the criteria absorbed (each with where it went and its test) or waiting. The work is done when nothing failed and the owner has read the **not verified** list; until then, say what is missing instead of "done". Next: `$thasmorato-skills:tm-walkthrough` or `$thasmorato-skills:tm-pr`.
