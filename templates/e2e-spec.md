<!--
TEMPLATE: e2e-spec (.scratch/<feature>/plans/<NN>-<slug>/e2e.md: the end-to-end test each acceptance criterion gets)
Written by /tm-plan beside plan.md, only when the repo has an E2E runner; read by /tm-implement,
whose SI that owns an AC writes the test from its entry and fills `Test` and `Written at`.
RECONCILE on every re-plan, never rewrite: an AC that is new is `new`; unchanged, with its test as
/tm-implement wrote it, `preserved`; whose test was changed after `Written at` by anyone else
(a later commit or an edit by hand), `manual`, never overwritten: its spec text is updated and the
difference shown to the owner; whose words changed, `updated`, and the owning SI rewrites the test;
removed from the ticket, `deleted`, and the test is proposed for removal for the owner to confirm.
-->

---
kind: e2e-spec
plugin_version: <the "version" in ${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json>
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
instructions: [<every value the project instructions already in your context ask this field to list, exactly as written; [] when none does; never open a file to find one>]
slug: <NN>-<slug>
plan_revision: <the plan's revision this spec was reconciled with>
runner: <the repo's E2E runner and its config, e.g. Playwright, playwright.config.ts>
---

# E2E: <NN> <Ticket title>

### AC-<n>: "<the criterion's words>"
- **State:** new | preserved | manual | updated | deleted
- **Seam:** <where a user enters: the route, the screen, the command>
- **Given:** <the state, built through the app or the project's fixtures>
- **When:** <what the user does>
- **Then:** <what the user sees, checked mechanically>
- **Test:** <path › test name; `pending` until /tm-implement writes it>
- **Written at:** <the commit that wrote the test; `pending`>
