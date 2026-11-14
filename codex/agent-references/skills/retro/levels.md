> Part of the `retro` skill (see `<plugin root>/agent-references/skills/retro/index.md`). Also read by `$thasmorato-skills:tm-session-analyze`, its `session-segment-analyst`, and `$thasmorato-skills:tm-flow-report`.

# Where a finding lands: three levels

A finding about how the work went is about one of three things, and each has its own place to change. Tag every process finding with the level whose file it would change:

| Level | What it is | Where it lands | Who changes it |
|---|---|---|---|
| `flow` | the plugin's process would do this wrong on any project: a stage's instructions, a gate, a template, an agent | the report, and from there `$thasmorato-skills:tm-flow-report`, across projects | the plugin's next version; never edited from inside a project |
| `repo-skill` | a convention of this repo or this team: a ticket structure the team fixed, a naming rule, a library preference | this repo's skills and guides: `.claude/skills/`, the `testing-guide-<project>`, the stack guides, `docs/guidelines.md`, `CLAUDE.md` | the stage that owns that file |
| `repo-code` | a defect or a gap in this repo's code or configuration | a ticket, or a check | the stage that owns that file (`$thasmorato-skills:tm-tickets`, `$thasmorato-skills:tm-guardrails`) |

**The question that picks the level:** does it hold for any project (`flow`), for this repo (`repo-skill`), or is it a defect in the code (`repo-code`)? When unsure, take the lowest level that resolves it: a `flow` change reaches every user of the plugin, so it needs the stronger case, evidence that it would recur on a project that is not this one.

**A repo convention extends the plugin's stage, without copying it.** When a team's convention changes what a plugin stage produces (every ticket here carries a fixed section), the change is a repo skill that names the plugin stage it extends and adds only the difference. It never copies the stage's instructions, and the plugin's stage is not edited for one repo.

**Old reports.** A report from before the three levels tags its findings `project`. Read an old `project` finding as `repo-skill` when its change names a guide, a skill, a rule or `CLAUDE.md`, and as `repo-code` when it names code, configuration or a check, and say it was read that way. `$thasmorato-skills:tm-flow-report` reads only `flow`, old or new.

## After the report: stop
The stage writes its report and stops. It shows the findings by level, each `repo-skill` and `repo-code` finding with the stage that owns its file; the owner chooses what to apply, and runs that stage. A `flow` finding is never applied here: it waits in the report for `$thasmorato-skills:tm-flow-report`.
