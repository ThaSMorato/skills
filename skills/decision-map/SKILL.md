---
name: decision-map
description: 'Keep the map of decisions an effort needs before its PRD, when the effort does not fit one session and its path is not yet clear: the destination, what is decided and where it lives, what is open and which stage resolves it, and the fog. One decision per session. Use on "decision map / what do we still need to decide / where does this effort stand", or when /tm-flow offers it.'
disable-model-invocation: true
user-invocable: false
---

> Read by path, not loaded: `${CLAUDE_PLUGIN_ROOT}` in this file is the plugin root, the folder that holds the `skills/` this file is in.

Some efforts are too big for a session and too unclear for an interview: the questions themselves are not known yet, and each answer changes which question comes next. Without a map, the decisions scatter across conversations, the ones taken in passing are forgotten, and the work starts before the path is clear. This stage keeps one file, `.scratch/<effort>/decision-map.md`, in the format of `${CLAUDE_PLUGIN_ROOT}/templates/decision-map.md`, and moves it one decision per session.

## Create
1. **The destination first.** Ask where the effort ends, and bound it: an epic, a release, a migration, never "the whole product". Write it and get the owner's agreement before any decision: every decision below is judged against it. **Done when** the owner agrees with the sentence as written.
2. **The first pass.** With the owner, list what has to be decided before a PRD can be written: each as a precise question with its type and what it waits for, and what cannot be asked precisely yet as fog. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/decision-map.mjs" elsewhere --effort <effort>` and list what it prints under **Open elsewhere**.
3. **When the pass finds no fog** and every decision fits one interview, say so and offer to skip the map: `/tm-interview` is the shorter path, and a map with nothing to steer is a document nobody needs.

## Resume: every session, in this order
1. **Record what came back.** The decision the last session sent out (its `Next step`) moves to **Decided** when its stage settled it, with the date and where it lives: the brief's `> Decided:`, a research report, an ADR, a chosen prototype variant. A decision that changed keeps its id and line, gains `(revised <date>; was: <the earlier decision>)`, and every open decision that rested on it is checked again.
2. **Sweep what was decided elsewhere.** Decisions get taken in stages and documents the map did not send them to: a research report, an ADR, the brief. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/decision-map.mjs" decided --effort <effort>`: it lists every `> Decided:` marker in the effort's folder and in `docs/`, and every ADR with its state. Each one that answers an open decision closes it (the row leaves **Open decisions** and gets a Decided line pointing at it); each one that answers nothing on the map but binds the effort gets a Decided line too. A decision nobody records here is one the map says is still open.
3. **Review every fog item against that list.** Each one is still fog, became a precise question (it moves to **Open decisions**), was settled somewhere (it moves to **Decided**, with where), or left the effort (it moves to **Out of scope**). Ask the owner only about the items the list does not settle. Update the `Last reviewed` date. Fog that is never reviewed stays listed after it has been resolved.
4. **Refresh Open elsewhere** with the script, as in Create.
5. **Pick one decision.** The frontier is `node "${CLAUDE_PLUGIN_ROOT}/scripts/decision-map.mjs" frontier --effort <effort>`: the open decisions nothing open still blocks. Offer them to the owner as one structured choice, with your recommendation (the one that unblocks the most). **One decision per session**: a map moved three decisions at once is a map whose second and third decisions were taken without the first one's answer.
6. **Name the stage that resolves it**, by its type, as the `Next step`, and stop.

| Type | Resolved by |
|---|---|
| conversation | `/tm-interview` for a product question. A question about the effort's own path (an order, what waits for what) is asked here, as one structured question, and lives in the map as `here` |
| prototype | `/tm-prototype`; the owner chooses the variant, never the agent |
| research | `/tm-research`; it can run in parallel with the other open decisions |
| someone outside | `/tm-questionnaire`, for the person who has the answer |
| owner task | something the owner does (evaluate a version, run a flow, ask a person) that unblocks a decision; the map names it and waits |
| as-is | `/tm-analyze`, in brownfield: what is already true here |

## Rules
- **The map never writes code.** An item that looks like a piece of the build (write the adapter, set up the table) is misclassified: it belongs to a ticket, after the PRD.
- **It points, it does not store.** A decision lives in the document it binds; the map's line says where. Only a decision about the effort's own path lives here.
- **It closes when** no decision is open and the fog is empty or moved out of scope. Set `status: closed` and point the next step at `/tm-prd` (or `/tm-fdd <feature>` in the Feature gear). The map never becomes the plan: cutting the work into epics, waves or tickets is `/tm-decompose`'s, from the PRD.
- **Every Decided line has one shape:** `- **D-<n>** (<YYYY-MM-DD>): <the decision>. Lives in: <path#anchor | here>`. A decision that was never an open row (a fog item settled, one swept from elsewhere) takes the next free id; an id is never reused.
- Keep the frontmatter counts (`decided`, `open`, `fog`) equal to the sections.

## Output
The map, written to `.scratch/<effort>/decision-map.md`. Report the destination, what was recorded this session, the fog that moved, the frontier, and the next step as the command for the owner to run.
