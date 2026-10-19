---
name: flow-report
description: 'Gather what several projects learned about the plugin itself: read their /tm-retro and /tm-session-analyze reports, keep the findings tagged flow, group them by the stage they would change, put the flow measurements side by side per plugin version, and rank what the next version should change. Use when planning the next version of the plugin, on "/tm-flow-report" or "what should the next version fix".'
argument-hint: "<project paths, or a file listing them one per line>"
user-invocable: false
---

Read [reporting policy](../../policies/reporting.md) before performing this stage; apply its contracts to the output.

`/tm-retro` and `/tm-session-analyze` run inside a project and write there. Each tags the findings that are about the plugin's own process as `flow`. This stage reads those reports **across projects** and turns them into the input for the next version: which stages, gates and templates keep going wrong, and whether the last version moved the numbers it was meant to move.

## 1. Collect
Resolve the projects from explicit paths or a path-list file. With no argument, execute `node ../../scripts/report-registry.mjs list` (resolve the script relative to this skill), use available entries and list missing entries without aborting. For each project, read
- `docs/retro/*.md` (`kind: retro`): the **What to change in the process** rows tagged `flow`, the **Measurements** with their `plugin_version` column, and the `plugin_versions` in the frontmatter;
- `docs/meta-retro/*.md` (`kind: meta-retro`): the **Flow findings**, the **Repeated across segments** items, and the **Environment** rows tagged `flow`, with the report's `plugin_version`.

A retro from before the `flow` / `project` tag has untagged changes: list them apart, as **untagged**, and judge each by the tag rule (would it recur on any project?), saying it was judged here.

With more than three projects, delegate to subagents once per project, all in a single message, each told to return exactly the items above with their file and section; the synthesis stays here.

**Done when** every project is accounted for: its reports read, or named as having none.

## 2. Group by what would change
Group the flow findings by the **plugin file they would change**: a stage (`/tm-plan`, `/tm-review`), a skill, an agent, a template, a gate category. Merge findings that are the same problem seen in different words, keeping every instance.

Rank by evidence:
1. **Repeated across projects**: the strongest signal there is; the problem does not depend on one codebase.
2. **Repeated across sessions or retros in one project**: real, but possibly about that project; say so.
3. **Single**: listed, not proposed.

## 3. Measurements, per version
Put the flow measurements side by side **per `plugin_version`**, summed across projects: escalations per ticket, validation runs to `clean` and the categories that fired, review findings and each lens's precision (refuted over raised), trim and tidy reverted over applied, diagnoses `cause-found` over all, walkthrough `missed` over questions. For each, the direction from the previous version, and how many tickets it rests on. A version with a handful of tickets is reported with its count and no trend: a direction from three tickets is noise.

## 4. Propose
For each group in tiers 1 and 2: the change to the plugin (which file, what it should do differently), the instances it rests on (project, report, row), and the measurement it should move. Proposals that touch the same file are merged. The owner decides what enters the next version's backlog; nothing here edits the plugin.

## Output
Write `docs/flow-reports/<YYYY-MM-DD>.md` in the current directory, filling `../../templates/flow-report.md`. Quote findings as the reports state them; never copy code or data from the projects, which may be private.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
