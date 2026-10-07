---
name: teach
description: 'Teach the user a topic over several sessions, in a teaching workspace that keeps the mission, the trusted sources, what has been learned, and short HTML lessons with practice. Use on "teach me / I want to learn / explain X so I really get it" when the goal is to learn, not to get one answer.'
disable-model-invocation: true
argument-hint: "<what you want to learn>"
---

Learning a topic is a project over many sessions, not one answer. This stage treats the current directory as a **teaching workspace** whose files carry the learner's state between sessions, and teaches through short lessons, each tied to why the learner wants the topic and pitched just past what they already know.

## The workspace
Create each file lazily, when there is something to put in it. The formats are in [`workspace.md`](workspace.md).

| File | Holds |
|---|---|
| `MISSION.md` | why the learner wants this: the concrete outcome, what success looks like, constraints, what is out of scope |
| `RESOURCES.md` | the trusted sources, in two groups: knowledge (books, docs, papers) and wisdom (communities where the skill is tested for real) |
| `learning-records/NNNN-<slug>.md` | what the learner has shown they know, what they already knew, misconceptions corrected, mission changes. Like ADRs: numbered, superseded instead of deleted |
| `GLOSSARY.md` | the topic's terms, added once the learner can use them |
| `lessons/NNNN-<slug>.html` | one lesson each: the unit of teaching |
| `reference/*.html` | the compressed essence for quick lookup: cheat sheets, syntax, algorithms, flowcharts |
| `assets/` | components shared by lessons: the stylesheet, quiz widgets, simulators |
| `NOTES.md` | how the learner likes to be taught, and working notes |

## Every session
1. **Mission first.** With no `MISSION.md`, or a vague one, ask why they want this before teaching anything: what changes in their work or life when they have it. "Ship a Rust CLI to my team" is a mission; "learn Rust" is not. A mission is what lets you choose what to teach next. **Done when** `MISSION.md` names a concrete outcome and what success looks like.
2. **Sources before teaching.** Your own knowledge is not a source. Until `RESOURCES.md` holds trusted sources for what the next lesson needs, find them: call the Agent tool with `researcher` on the topic (it reports with citations), and keep the best in `RESOURCES.md`, each with one line on what it covers and when to use it. Name gaps where no good source exists.
3. **Choose the next lesson** from the mission and the learning records: the most useful thing in the **zone of proximal development**, hard enough to stretch, close enough to reach. If the learner names what they want, teach that, at their level. Never re-teach what a record says they know.
4. **Write the lesson** by [`lessons.md`](lessons.md), save it to `lessons/`, open it for them, and print its path.
5. **Record what was learned**, only on evidence: a question answered correctly, an exercise done, prior knowledge stated. Coverage is not learning. Write a learning record, add terms the learner can now use to `GLOSSARY.md`, update `MISSION.md` (after confirming) if the goal moved, and note preferences in `NOTES.md`. **Done when** each record cites its evidence.

## Knowledge, skill, wisdom
- **Knowledge** comes from trusted sources, and every claim in a lesson cites one. For acquiring it, difficulty is the enemy: keep the load light.
- **Skill** comes from practice with fast feedback. For keeping it, difficulty is the tool: recalling from memory, spacing practice over sessions, and mixing related topics in practice build lasting retention, while rereading builds only fluency, the in-the-moment ease that feels like mastery and fades.
- **Wisdom** comes from using the skill outside the workspace. When a question needs it, give your best answer and point to a community from `RESOURCES.md` where practitioners can test it. If the learner does not want communities, note it and stop suggesting them.
