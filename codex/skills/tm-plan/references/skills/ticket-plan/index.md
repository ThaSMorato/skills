---
name: ticket-plan
description: Break one ticket into a validated implementation plan, vertical Step Implementations (SIs) with tests, dependencies, and acceptance criteria, ready for the SI-by-SI implement loop. Use before implementing a ticket, on "plan this ticket / break this into steps", or right after $thasmorato-skills:tm-design.
disable-model-invocation: true
user-invocable: false
---

Turn one ticket into a **plan** the `implement` loop can execute SI by SI. This skill decides *how* the work is sliced; it does not write production code and it does not make the design decisions.

## 1. Gather context
Read the ticket (`.scratch/<feature-slug>/issues/<NN>-<slug>.md` or the reference passed as an argument) plus the docs that constrain it: the **node map** (`.scratch/<feature-slug>/design/<NN>-<slug>.md`), the feature spec (`docs/features/*/fdd.md`), the boundary contract (`docs/architecture/boundaries.md`), the decisions (`docs/adr/*.md`), the repo standard (`docs/guidelines.md`, plus the stack guides its routing table names for the files involved), and the glossary (`CONTEXT.md`). A library or framework behavior the plan leans on is read in the version the repo installs, by `references/skills/ticket-design/library-docs.md`. SI names and interface vocabulary come from the glossary; the ADRs, the boundary contract and the guidelines are binding in the area you touch.

**Read what earlier tickets left open.** For every earlier ticket of this feature with a review (`.scratch/<feature-slug>/reviews/*.md`), read its Resolutions and the findings deferred or left unfixed: one that lands in a file this plan touches is handled by an SI here or named as still deferred, never rediscovered by the next review.

**When `plan.md` already exists**, this is a re-entry. Read its `validation.md` first:
- `dirty`: revise the plan against the open findings, without asking whether to; that is what the verdict is for.
- `clean`, or no validation: ask whether to keep it or revise it, as a structured choice.
- `progress.md` shows SIs done: the plan is **in execution**. Done SIs are frozen: never renumber, rewrite or delete them. An amendment adds an SI after the last id (`SI-5`) or edits a pending one, the Dependency Map and the AC coverage follow, and `revision` goes up by one. A change a done SI would need is a new SI that changes that code again.

Every amendment invalidates the verdict (its `plan_sha256` stops matching), so the next step is `$thasmorato-skills:tm-plan-validate` again.

**A `bugfix` ticket with no diagnosis stops here:** when its `type` is `bugfix` and no `.scratch/<feature-slug>/diagnoses/` file with `status: cause-found` is its Source, tell the owner to run `$thasmorato-skills:tm-diagnose` first; planning a fix for an unknown cause plans a guess.

**If there is no node map, stop** and tell the user to run `$thasmorato-skills:tm-design <ticket>` first. Do not design inside this skill: the two stages have separate gates, and collapsing them means the user confirms the map and the slicing in one breath, with the map never written down.

## 2. Slice into Step Implementations
An **SI** is one **vertical tracer-bullet slice**: a narrow but complete path through the layers it touches, sized for a single red → green → refactor cycle that fits one fresh context. Never slice horizontally (all of one layer, then the next).

For each SI, write down: **Description**, **Technical actions** (ordered), **Tests** (which seams/layers, per the `testing` skill, or `none (<reason>)` for a pure-infra SI), **Dependencies** (other SIs that gate it), **Acceptance criteria** (observable outcomes, each naming the **ticket AC id** it serves). Tests go at **pre-agreed seams**; name them here so the implement loop writes the failing test first.

**Weigh the node map before you slice.** One SI is the right answer when the ticket is small, when it extracts something and wires it in, or when the seams split a piece of work that is already built (`reuses` and `extends` nodes, with one new node). Slice by **how each part is verified**: what one check at one seam proves is one SI, whatever the count of ACs it closes.

**Start coarse.** Every SI costs a pause, a fresh context and a test cycle, so the plan with the fewest SIs that still clears the floor and the ceiling (`references/skills/ticket-plan/PLAN-FORMAT.md`, Rules) is the one to propose. Before presenting, merge:
- SIs that touch the same file, function, node or screen;
- SIs verified by the same check: what one browser pass sees, copy-only changes, several validations of the same input;
- an SI whose only consumer is another SI (a helper, the plumbing, a "simple version" the next SI replaces with the full rule) into that SI;
- an SI with no production code of its own (only a test, only setup) into the SI whose behavior it serves.

At `gear: small`, aim for 1 to 3 SIs. Above it, the count follows the seams the ticket crosses, not its ACs: several ACs checked at one seam are one SI.

**Two plausible ways and no source that chooses.** When a node can be built two or more ways that the ticket, the node map, the ADRs and the repo's existing code do not decide between (two libraries, two persistence shapes, two protocols), do not pick one: write a `> Needs Input:` under the SI and name `$thasmorato-skills:tm-research "<the question>"` for the owner to run. The plan is finished when the research answers it.

**Think through the consequences** of each requirement before writing an SI: a derived value that can collide, a constraint new data can break, two writers at once, a sequence that must be atomic, a failure halfway. Each one the ticket implies is handled by an SI's actions and named in its tests; `$thasmorato-skills:tm-plan-validate` reports a missing one as `RC`.

The SIs implement the node map's nodes: an SI that introduces a module the map does not have, or gives it a different interface, is a divergence to resolve now: go back to `$thasmorato-skills:tm-design` rather than quietly redesigning here.

**A structural ticket plans differently.** When the ticket's `Type` is `structural`, the plan carries the rule explicitly: behavior is unchanged, existing tests are **not modified**, and they stay green throughout. There is no red step for a slice that adds no behavior; the existing suite is the test.

Prefactoring SIs go first ("make the change easy, then make the easy change"). Then build the **Dependency Map** and the **Deliverables** checklist. The full format is in `references/skills/ticket-plan/PLAN-FORMAT.md`; follow it exactly.

## 3. Confirm, then emit
Present the SI breakdown to the user (per SI: name, what it delivers, its blockers), with the coarsest slicing that clears the floor and the ceiling as the recommended answer. Ask whether the granularity and the seams are right as a structured choice; when the options are merges that can combine ("SI-2 into SI-1", "SI-5 with SI-6"), make it multi-select, so the owner picks several instead of typing "2 and 3". Iterate until they approve, then record the approved slicing in the plan's `## Slicing` section as `> Decided: <value> — owner, <YYYY-MM-DD>`: that marker is how `$thasmorato-skills:tm-plan-validate` knows the size question is settled. Then write the plan to `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

**Write it incrementally.** Write the frontmatter, the Objective and SI-1 first, then add each SI, the Dependency Map, the prerequisites, the coverage and the Deliverables with `Edit`, one section per edit. A long plan written in one call is lost whole when the call is cut; written in sections, it resumes at the last one.

**Check it before you hand it over**, and again after every amendment:
- every ticket AC has an SI that owns it, by id;
- every clause of every AC, and every line of the FDD's errors, exclusions and limits this ticket touches, has a named test;
- every `new` node has its row under the node map's Seams and Conventions, and every `Mirror:` cites a Conventions row;
- every script the plan reuses or names was read;
- every test case says whether it starts red or green, after grepping the assertions it touches;
- every SI lists the contracts it changes and their consumers, and no SI leaves a test red for the next one to fix.

Every acceptance criterion in the ticket must be owned by at least one SI, **by id**, and every SI's tests must make its acceptance criteria observable. If either fails, the slicing is wrong; fix it before writing.

## 4. Validate
Tell the user to run `$thasmorato-skills:tm-plan-validate <slug>` next. The plan is not ready for `$thasmorato-skills:tm-implement` until validation reports `status: clean`.
