<!--
TEMPLATE: ui-spec (one screen's design, the source of truth for building and checking it)
Filled by /ui-design. /design builds the node map from it; /acceptance checks the running screen
against its states and widths; the next redesign starts from it.
Every value a builder would otherwise invent is here, decided or marked: `> Decided:` for what the
owner chose or supplied (with its source), `> Assumed:` for what nobody could answer, per the
`asking` skill. PRUNE optional sections that don't apply; (required) sections always stay.
The written file STARTS with the frontmatter below; this comment is not copied.
-->

---
kind: ui-spec
plugin_version: <the "version" in ${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json>
screen: <screen-slug>
situation: extend | new-in-established-world | redesign | no-visual-authority
mode: operate | read | persuade | experience
status: draft | approved
audit: <.scratch/ui-audit/<screen>/audit.md, or none>
critic_verdict: ship | fix | rebuild
---

# UI spec: <screen>

## Brief (required)
> The job: who arrives, in what situation, the one thing they must understand or do, and what
> success looks like. The boundaries: what must not change, what is out of scope.

## Direction (required)
> The chosen contract (thesis, first view, structure, language, risk), as `> Decided:`, and the
> audit problems (`UA-N`) it solves when this is a redesign.

## Content (required)
| Element | Source | Min | Typical | Max | When missing |
|---|---|---|---|---|---|

## States (required)
> One line per state the brief kept (first use, empty, loading, error, partial, success, no
> permission, overflow): what the user sees, and the capture that shows it.

## Copy (required)
| Where | Text | Source |
|---|---|---|

## Layout and widths (required)
> The regions and what leads, per width (at least a phone and a desktop width), and what changes
> between them.

## Components and tokens (required)
| Component | Existing (`path`) or new | Variants and states |
|---|---|---|
> The tokens used by role. A new component or token is named as new, with why the existing ones
> do not serve.

## Interactions (optional)
> What responds to what: focus order, keyboard, motion (what moves, duration), validation timing.

## Open decisions (optional)
> What is still undecided, each with who decides.

## Captures (required)
> The final captures under docs/ui/<screen-slug>/, by state and width.
