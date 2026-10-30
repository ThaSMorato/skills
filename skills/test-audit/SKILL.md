---
name: test-audit
description: 'Audit a whole test suite, or one path of it, for what it lacks and what it carries for nothing: behavior no test reaches, error paths nobody drives, feature rules whose test does not exist, against tests that duplicate another, test the framework or the implementation, or cover code that is gone; with mutation testing over the suite at the report level. Three levels: report, confirm (remove one at a time, with the owner), full (also write the missing tests, test-first). Use on "audit the tests", "is this suite any good", "which tests are missing / useless".'
disable-model-invocation: true
user-invocable: false
---

> Read by path, not loaded: `${CLAUDE_PLUGIN_ROOT}` in this file is the plugin root, the folder that holds the `skills/` this file is in.

A suite grows by addition. Every ticket adds tests and almost none removes one, so after a year it has duplicates nobody reads, tests of the framework, tests of code that is gone, and still no test for the error path that broke last month. `/tm-review` sees one diff at a time and cannot see any of that. This stage reads the suite as a whole and asks the only question that matters about it: **what would it catch?**

## Scope and level
`/tm-test-audit <path> [report | confirm | full]`. The path is the code and tests to audit (default: the repo's test roots and the code they cover); the level is how far the stage goes (default: `report`).
- **`report`**: reads and runs, changes nothing. The only level where mutation runs over the whole scope.
- **`confirm`**: the report, then removes the excess the owner picks, one test at a time.
- **`full`**: `confirm`, then writes the missing tests the owner picks, test-first, one at a time.

## 1. Read the standard
Call the Skill tool with `thasmorato-skills:testing` and read its `fundamentals.md`: *Worth a test, and not*, the mocks limit and *Mutation testing* are what this stage applies. Load the project's `testing-guide-<project>` when `docs/guidelines.md` routes to one; where it disagrees, it wins. Read the stack guide's mutation tool, and the `## Rules` of each feature's `fdd.md` under the scope, with their `Tested by`.

## 2. Absence: what the suite does not catch
- **A public behavior no test reaches**: an exported function, a route, a handler, a command, a job, with no test that calls it through its interface.
- **An error path nobody drives**: a catch, an error response, a retry that gives up, with no test that makes it happen.
- **A rule whose test is missing**: a feature rule whose `Tested by` names a test that does not exist, or one that does not assert the rule.
- **A diagnosed bug with no pinned and flipped tests** (`.scratch/*/diagnoses/*.md` with `status: cause-found`).

Each finding carries `file:line` of the code, and what the missing test would assert, in one line.

## 3. Excess: what the suite carries for nothing
- **Duplicate**: two tests asserting the same behavior through the same seam with inputs of the same class. The clearer one stays.
- **Not worth a test**, by the fundamentals' list: the framework doing its job, a trivial accessor, a constant.
- **Implementation-coupled**: asserts on internals, mocks the unit's own collaborators, more doubles than the mocks limit; it breaks on a refactor that changes no behavior.
- **Dead**: covers code that no longer exists, or is skipped (`skip`, `xit`, `@Disabled`) with no ticket saying why.
- **Tautological**: the expected value recomputed the way the code computes it.

**Removal is conservative.** A test is proposed for removal only with its evidence: the other test that still covers its behavior (`file:line`), or the proof that the behavior is gone. In doubt, it stays. Never proposed for removal: a pinned bug test (removing it is the owner's call after the fix), a test a feature rule's `Tested by` names, a contract test.

## 4. Mutation over the scope (`report`)
When the stack guide names a mutation tool, run it over the scope's production code: on demand here, and, for a suite too large to mutate in a session, suggest a nightly CI job (`/tm-guardrails` installs CI checks). Each surviving mutant is a finding: file, line, the change, and what it points at (a missing assertion, a missing boundary, dead code). An equivalent mutant is marked with why it is equivalent. With no tool, say so; never report a percentage as the result.

## 5. Apply (`confirm` and `full`)
Present the findings grouped by section, each with its evidence, as a structured choice; none is applied by default.
- **A removal**: delete the one test, run the scope's suite (call the Agent tool with `test-runner`), and keep the removal only when it stays green and the covering test the evidence named still runs. Then the next.
- **A missing test** (`full`): write it test-first with the `tdd` skill, show it red with `${CLAUDE_PLUGIN_ROOT}/scripts/mutate-once.mjs` when it starts green, then the next.

Version control stays with the owner: say which commit you suggest for the removals, apart from the additions.

## Output
Write `docs/analysis/test-audit.md`:

```markdown
---
kind: test-audit
plugin_version: <the "version" in ${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json>
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
instructions: [<every value the project instructions already in your context ask this field to list, exactly as written; [] when none does; never open a file to find one>]
scope: <path>
level: report | confirm | full
audited_commit: <git rev-parse HEAD>
tests: <count of tests in the scope>
absent: <n>
excess: <n>
mutants: {killed: <n>, survived: <n>, equivalent: <n>}   # or `not run: <reason>`
removed: <n>
added: <n>
---
```

Then `## Absence`, `## Excess` and `## Mutation`, each finding with its evidence and, at `confirm` and `full`, its outcome (`applied`, `declined`, `reverted` and why). `/tm-retro` reads the counts; a second audit of the same scope compares them with this one.
