<!--
TEMPLATE: flow-report (what several projects taught about the plugin's own process)
Filled by /flow-report from the projects' docs/retro/ and docs/meta-retro/ reports. Only findings
tagged `flow` (or untagged ones judged flow here, marked as such) and the flow measurements.
EVERY ITEM CITES ITS INSTANCES: project, report, row. Never copy code or data from a project.
The written file STARTS with the frontmatter below; this comment is not copied.
-->

---
kind: flow-report
date: <YYYY-MM-DD>
projects: [<each project read>]
plugin_versions: [<each version the reports cover>]
findings: {cross_project: <n>, single_project: <n>, single: <n>, untagged_judged: <n>}
---

# Flow report: <date>

## Projects read (required)
| Project | Retros | Meta-retros | Plugin versions | Not read, and why |
|---|---|---|---|---|

## Repeated across projects (required)
> The strongest signal: the same problem in more than one codebase. Grouped by the plugin file it would
> change. `none` if nothing repeated.

| Plugin file | Problem | Instances (project · report · row) | Proposed change | Measurement it should move |
|---|---|---|---|---|

## Repeated within one project (required)
> Real, but possibly about that project. Same columns, plus why it may still be the plugin's.

## Single findings (optional)
> Listed so they are not lost; not proposed.

## Measurements by plugin version (required)
> Summed across projects, per version, each with the number of tickets it rests on. A direction is shown
> only when both versions rest on enough tickets to mean something; otherwise the count, and no arrow.

| Measurement | <version A> (tickets) | <version B> (tickets) | Direction |
|---|---|---|---|
| Escalations per ticket | | | |
| Validation runs to clean | | | |
| Review lens precision (refuted / raised), per lens | | | |
| Trim and tidy reverted / applied | | | |
| Diagnoses cause-found / all | | | |
| Walkthrough missed / questions | | | |

## Untagged findings judged here (optional)
> From reports older than the flow / project tag: each with the judgement made and why.

## What the reports couldn't tell me (required)
> Projects with no reports, versions with too few tickets, stages no report mentions (unused, or
> working: the reports cannot say which).
