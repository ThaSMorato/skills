---
name: retro
description: Look back over a finished epic, feature or cycle by reading what the work left on disk (plans, validations, progress notes, review findings) and record what it taught about the process and about the product. Use after a set of tickets completes, or at the end of a cycle.
disable-model-invocation: true
user-invocable: false
---

Every stage in this flow writes forward. Nothing writes back: the documents freeze at approval, and what the work taught lives in progress notes nobody reopens and in a conversation that is gone after `/compact`. This stage closes that loop: once, over a finished chunk, from the artifacts.

It runs after a set of tickets completes, at the end of an epic or of a cycle, and over the set: one ticket has no repetition to find, and repetition is most of the value here.

## The one rule
**Every claim cites the artifact it came from.** You are reading files, not remembering a project. This is the difference between a retro that is worth writing down and one that manufactures plausible observations, and the second kind is worse than none, because it reads as verified.

What is on disk is a fix loop that hit three attempts, a validation that took four rounds to go clean, a deliverable that failed: write those. That something was hard, that a decision was debated, that an estimate was optimistic is on no file: it goes under *What the artifacts couldn't tell me*.

## Workflow
`$thasmorato-skills:tm-retro <epic | feature | cycle | ticket ids>`.

1. **Resolve the scope** to the `.scratch/<feature-slug>/` directories it covers, and to `<feature>/<NN-slug>` ids when it names only some tickets of a feature. **Done when** every part of the scope is a feature or a ticket on disk, or the owner has been asked about the part that is not.
2. **Measure.** Run `node "references/scripts/retro-measure.mjs" <feature | feature/NN-slug>...`. It measures every finished ticket in scope and names the ones it left out as not finished. When it measured none, say *"Nothing finished in `<scope>` yet. A retro over unfinished work reads the plan, not the outcome."* and stop. **Done when** the section is printed and the owner has been told which tickets were left out.
3. **Read the artifacts** of every measured ticket, by the table under *What to read*, `validation.md`'s `Resolved` sections first. **Done when** each file of the table that exists for each ticket has been read and each missing one is named as missing: a ticket with no file under `reviews/` was reviewed before `$thasmorato-skills:tm-review` kept its findings, so that lens is absent from this retro, not empty.
4. **Write the Measurements.** Paste the script's section whole into the report and copy its three frontmatter lines. Read it as *Reading the measurements* says: the totals by plugin version, by author and by gear, the reviews by pair, **Instructions, per harness**, and each ticket's Minutes and Tool calls. Set the previous retro's totals beside these. **Done when** the section is in the report unchanged, and the comparison names the previous retro or says this is the first.
5. **Explain** each planned-versus-done divergence and each gate category that fired, citing the file that shows it. **Done when** every ticket whose SIs planned and done differ has a row, its reason quoted from where it was written or named as not written down.
6. **Collect what struggled and what repeats:** escalations, failed deliverables, and review findings that recur across tickets, by *What repetition means*. **Done when** every pattern names two or more instances and every single occurrence is listed as an incident.
7. **Map the debt**, by *Debt the reviews saw and nobody owned*. **Done when** every `pre-existing` finding in scope sits in an area, and each hotspot is proposed or listed.
8. **Take the environment**, by *The environment*. **Done when** each category `$thasmorato-skills:tm-retro` reads has its evidence cited, or says there is none in scope.
9. **Sort every finding**, by *Two outputs, two subjects*. **Done when** each finding has one destination, and each process finding one level.
10. **Write** the report, append the product findings to `docs/evolutions.md`, and record the report: `node "references/scripts/report-registry.mjs" record <the report file>` adds it, with its counts by level, to the registry `$thasmorato-skills:tm-flow-report` reads. **Done when** the command printed the entry.
11. **Self-review.** **Done when** every claim in the report points at a file, nothing describes how the work felt, and each gap is named under *What the artifacts couldn't tell me*.
12. **Report.** Show the owner the report's path, the measurements beside the previous retro's, the findings by level, the product findings appended, and what the artifacts couldn't tell. Each `repo-skill` and `repo-code` finding names the stage that owns its file, for the owner to run if they choose; a `flow` one stays in the report for `$thasmorato-skills:tm-flow-report`. **Done when** the owner has seen all five. **Then stop.** This stage records; it changes nothing.

## What to read
| Artifact | What it tells you |
|---|---|
| `.scratch/<slug>/issues/<NN>-*.md` | what was asked for: acceptance criteria, exclusions, the declared type |
| `.scratch/<slug>/design/<NN>-*.md` | the node map, the interfaces intended |
| `plans/<NN>-*/plan.md` | how it was sliced, and the deliverable commands |
| `plans/<NN>-*/validation.md` | **the gate's history**: the `## Resolved` section keeps every issue cleared on a re-run, with its id |
| `plans/<NN>-*/progress.md` | what actually happened per SI: test results, escalations, out-of-scope notes |
| `.scratch/<slug>/reviews/<NN>-*.md` | the findings each lens produced; a `.second-opinion.md` is the other harness's review of the same change |
| `.scratch/<slug>/request-trace.md` | what the owner asked, part by part, and which parts were dropped or deferred, and by whose decision |
| `.scratch/<slug>/acceptance/<NN>-*.md` | what was checked in the running software, what only by tests, what not at all |
| `git log` over the ticket's range | the shape of what landed |

`validation.md`'s `Resolved` section is the most underused file in the suite: it is a per-ticket record of which category of mistake this project actually makes.

## Reading the measurements
The script reads every count from the frontmatter each stage wrote for this purpose, and sums them. The numbers in the report are its numbers.

- **`not measured` stays `not measured`.** The artifact predates the field. A number rebuilt from a sentence looks exactly like a measured one and is not.
- **Each row of a totals table is its own population.** Work done on two versions of the plugin is two populations: adding them hides exactly the change a new version was meant to make. The same holds by author: a review is read against the pair it closes (who implemented, who reviewed), so a cross-harness review stays apart from a same-model one.
- **Instructions, per harness** says whether the project's `CLAUDE.md` and `AGENTS.md` reached each stage: `followed`, `none` (the stage ran without them), `stale` (a value no file gives now) or `unknown` (the artifact predates the field). A harness whose artifacts show `none` ran without the project's rules: read its misses with that in mind instead of blaming the model.
- **Minutes and Tool calls** come from the Cost by stage rows of the `docs/meta-retro/` reports that name the ticket by its slug, as the extract writes them when the stage was invoked with it. A ticket no analyzed session covers, or one invoked only by its number, is `not measured`.
- **Review attention beside CI red after open:** a `light` pull request that reached CI broken is the attention rule missing something. `pending` is said as pending.
- **The previous retro** is named by the script. One retro is a snapshot; its totals beside the previous one's, version by version, are what shows whether a change to the flow did anything.

## Two outputs, two subjects
Sort every finding by **what it is about**, and keep the two apart:

**About the process** → `docs/retro/<YYYY-MM-DD>-<scope>.md`, filling `references/templates/retro.md`. Slices planned versus done, which gate categories fired, where the loop escalated, findings that repeat across tickets, and what should change, each naming the file it would change. **Tag every process finding with its level**, by `references/skills/retro/levels.md`: `flow` (the plugin's process, wrong on any project; `$thasmorato-skills:tm-flow-report` gathers these), `repo-skill` (this repo's skills, guides and `CLAUDE.md`) or `repo-code` (this repo's code and configuration). When unsure, the lowest level that resolves it, the same rule `$thasmorato-skills:tm-session-analyze` uses.

**About the product** → append to `docs/evolutions.md`, filling `references/templates/evolutions.md`. This is where the out-of-scope notes accumulated in every `progress.md` finally land instead of being reported into a chat window. Each entry cites the progress file it came from.

A defect in what shipped is a `repo-code` finding: it lands in a ticket, and the owner decides whether to open one. It is recorded once, in the process table, and stays out of `evolutions.md`.

## What repetition means
One occurrence is an incident. The same finding across several tickets is a **standard that should move**: a review finding that keeps recurring belongs in a stack guide, a rule or a check; a validation category that keeps firing belongs earlier in the flow, in the stage that produces what it catches. Call something a pattern when you can point at more than one instance, and name them.

Classify a repeated standard by `references/skills/retro/environment.md`: **mechanical** or **judgement**. A mechanical one is proposed as a check. A judgement one would become prose that every later run loads, so it first passes `references/skills/retro/promotion-filter.md`; one that fails stays in the retro as a finding, with the question it failed.

## Debt the reviews saw and nobody owned
A review finding with the verdict `pre-existing` is real, but in code the diff did not change, so it is nobody's work and it vanishes after the review. Across an epic, those are the most honest map of technical debt the project has: found by the lenses, confirmed by the verifier, and located to `file:line`.

1. **Collect** every `pre-existing` finding in the scope's review files.
2. **Group them by area**: the component that owns the path (`docs/architecture/components.md`), or the directory when there is no component map.
3. **An area is a hotspot** when its findings come from **two or more tickets**: one ticket's `pre-existing` finding is an incident. A finding the verifier marked as the precedent of a confirmed one (`pre-existing (precedent of <n>)`) makes its area a hotspot even from one ticket, and is proposed ahead of the others in its area: new code is already copying it. Where `docs/analysis/components/<c>.md` lists debt for the same area, cite it as corroboration. Where `docs/declined.md` has a `declined` entry covering the area, list the hotspot with that entry instead of proposing it, unless the entry's **Revisit when** has happened; then propose it and cite the entry.
4. **Propose at most 3 structural tickets**, ranked by **benefit against cost**. Benefit is the severity of the findings times the number of tickets that ran into them; cost is how much the fix touches (files, and whether the use is encapsulated or spread). Each proposal cites the findings it would close (review file and finding) and says why it is structural. The rest of the hotspots are listed.

The owner decides: a chosen proposal becomes a `Type: structural` ticket whose Source is this retro (`retro: <the report file>`).

## The environment
Read `references/skills/retro/environment.md` and take every category its table marks as read by `$thasmorato-skills:tm-retro`: the ones whose evidence is a file on disk. The categories only a conversation shows belong to `$thasmorato-skills:tm-session-analyze`: for those, cite the `Environment` sections of the `docs/meta-retro/` reports in scope, or say that no session was analyzed and that side was not read.

## This is a log, not a state file
`$thasmorato-skills:tm-flow` derives state from artifacts and refuses documents that must be maintained. The two outputs here are **append-only history**: a stale entry is still a true record of what was observed then. A second retro over the same scope is a new dated file (on the same day, the name gains `-2`), and a change to an earlier finding is a new entry that says so. The one thing derived from a retro is which tickets it covered, from the `features` and `tickets` lines of its frontmatter: a ticket that finishes later leaves its feature awaiting a retro again.

## The boundaries of this stage
- **It reads and records.** Every change it recommends names the stage that owns the file, and that stage makes it. A plugin file is never one of them (`references/skills/retro/levels.md`).
- **It describes the work.** The artifacts record what was done, not how well anyone did it; findings are about steps, gates and files.
- **A wrong decomposition is recorded**, here and in `evolutions.md`; `$thasmorato-skills:tm-decompose` amends the feature index and the effort's decomposition on its next run.
- **What happened is stated; why, only when written down.** That a slice shipped differently than planned is a fact on disk; its reason is quoted from where it was written, or named as not written down.
