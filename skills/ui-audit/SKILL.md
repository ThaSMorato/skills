---
name: ui-audit
description: 'Evaluate an existing screen in the running software and list its problems, numbered, with evidence and a severity: a design critique by an isolated agent (usability heuristics scored 0 to 4, cognitive load, personas), a technical pass (design-system drift, responsiveness, integrity, missing states), and the screen under worst-case real data. Reports; never edits. Use before a redesign, or on "audit / critique this screen".'
disable-model-invocation: true
---

A redesign that starts from taste replaces one set of problems with another. This stage names what is wrong with a screen as it runs today, with the evidence for each problem, so `/ui-design` has numbered problems to solve and the owner can judge each proposal by the problem it closes. It **finds**; it changes no product code.

## 1. Scope
Name one screen or one task (a URL or route, the user group, the device class), and its **surface mode**, which sets what matters most:
- **operate**: an app screen (dashboard, settings, a form, a table); scanability, consistency and platform conventions outrank expression;
- **read**: documentation or long content; structure for comprehension;
- **persuade**: a landing or pricing page; attention, belief and one action;
- **experience**: a portfolio or showcase; the work leads.

Read the context that says what the screen is for: the PRD or FDD and the tickets that built it, `CONTEXT.md` for the domain words, `docs/design-system.md` when it exists, and the stack guide for the UI code.

**Done when** the screen, the task, the users, the device classes and the mode are named, and the owner has confirmed the scope.

## 2. See it run
Find a browser tool and the running server the way `/acceptance` does (`${CLAUDE_PLUGIN_ROOT}/skills/acceptance/SKILL.md`, step 2): search for the tool, read the dev command and port, retry a failed navigation once, then ask the owner to start the server. Walk the task once **without judging**, to learn it. Capture the screen at the widths the project supports (at least a phone width and a desktop width) and in each state you can reach: default, loading, empty, error, and the screen with real data. Save the captures under `.scratch/ui-audit/<screen-slug>/`.

**Done when** each reachable state has a capture at each width, and each unreachable state is named with the reason.

## 3. Two assessments, in isolation
Run both before reading either, so neither biases the other:
- **A. Design.** Call the Agent tool with `ui-critic`, passing the captures, the scope from step 1 and the source paths of the screen. It scores the heuristics and the cognitive-load checklist in `heuristics.md`, walks the task as two or three personas chosen there, and judges design specificity. It returns findings with evidence, plus the strengths.
- **B. Technical and data.** Yourself, in the browser and the code: the checks in `technical.md` (design-system drift, responsiveness, integrity, missing states and omissions), then the worst-case run in `worst-case.md`. For accessibility, call the Skill tool with `ui` and apply its catalog; a finding there cites its rule.

**Done when** both assessments are complete, each finding has its evidence (a capture, a `file:line`, a measured value), and B was written before A's result was read.

## 4. Synthesize
Merge the two lists, then:
- **Group duplicates**: the same problem seen as a heuristic and as a missing state is one finding with both evidences.
- **Drop** a finding with no evidence and no concrete user who is hurt.
- **Rate severity after the evaluation, not during it** (`heuristics.md`, Severity): P0 blocks the task, P1 is major, P2 is minor with a workaround, P3 is polish.
- **Name the systemic patterns**: "hardcoded colors in 15 components" is one finding about the system, not fifteen.

**Done when** every finding has an id, a severity, evidence and the user it hurts, and the patterns are named.

## Output
Write `.scratch/ui-audit/<screen-slug>/audit.md`, numbered `UA-1`, `UA-2` in severity order, so `/ui-design` can cite the problem each proposal solves:

```markdown
---
kind: ui-audit
plugin_version: <the "version" in ${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json>
screen: <screen-slug>
mode: operate | read | persuade | experience
audited_at: <git rev-parse HEAD>
heuristics_score: <sum>/<max>   # n/a heuristics leave the maximum, never printed over a partial set
findings: <count>
by_severity: {P0: <n>, P1: <n>, P2: <n>, P3: <n>}
---

# UI audit: <screen>

## Scope
## Heuristics
| # | Heuristic | Score 0-4 | Key issue |
## Findings
### UA-1 (P0): <what is wrong, in the user's terms>
- **Where:** <state, width, element; `file:line` when known>
- **Evidence:** <capture path, measured value, worst-case value>
- **Who it hurts:** <persona or user, doing what>
- **Heuristic or rule:** <the one it breaks>
- **Direction of the fix:** <one sentence; the design is /ui-design's job>
## Systemic patterns
## Strengths
## Not covered
```

Also produce the HTML version for reading: call the Skill tool with `visuals` and follow its `html-report.md`, with the captures beside each finding.

## Gate
Report the score, the counts by severity, the P0 and P1 findings resolved to their words, the strengths, and what was not covered. Close with two to four questions that change what comes next (priority, what must not change, scope), each with options. Next: `/ui-design <screen>` with this audit as its input, or the fixes, one ticket each.
