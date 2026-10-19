---
name: decision-map
description: Map unresolved decisions for a bounded effort spanning multiple sessions before requirements are ready.
user-invocable: false
---

Read the brief, PRD, ADRs and existing `docs/decision-map.md`. Agree a bounded Destination with the owner before deciding anything; an epic is a useful bound, an entire V1 is not. Write `docs/decision-map.md` with Destination, Decided (one linked line per decision), Open decisions, Fog and Out of scope. Each open decision has ID, precise question, type, blockers and one canonical source link. Link existing brief/PRD Open questions and Needs Input markers rather than duplicating their state.

Types: conversation (`/tm-interview`), prototype (`/tm-prototype`, owner chooses variants), research (`/tm-research`, independent source reads can be parallel within that stage), external answer (`/tm-questionnaire`), manual unblocker, brownfield fact (`/tm-analyze`). An implementation task disguised as a decision is misclassified; this map never writes code. Fog contains decisions not yet precise enough to ask; once precise, move them to Open decisions.

Resolve at most one decision per session, recording its result and authoritative link. Recommend the owner command for that type, never call it. If an initial pass finds no fog and no unresolved uncertainty, say the map may be skipped in favor of `/tm-interview`. A closed map feeds `/tm-prd`. Deliver the map, show the unlocked frontier and stop.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
