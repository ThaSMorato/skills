> Part of the `teach` skill (see `SKILL.md`).

# Workspace formats

## MISSION.md
```markdown
# Mission: <topic>

## Why
<1 to 3 sentences: the concrete outcome the learner is after, and what changes when they have it>

## Success looks like
- <something specific and observable they will be able to do>

## Constraints
- <time, budget, prior commitments, how they like to learn>

## Out of scope
- <nearby topics they do not want to chase now>
```
One mission per workspace: two unrelated topics are two workspaces. Concrete over abstract ("run a half marathon by October", not "get fitter"). Keep it under a screen; past that it has become a plan. When the goal moves, update it after confirming, and write a learning record that says so.

## RESOURCES.md
```markdown
# <topic> resources

## Knowledge
- [<type: title, author>](<url>)
  <what it covers>. Use for: <when to reach for it>.

## Wisdom (communities)
- [<community>](<url>)
  <why it is trustworthy>. Use for: <what to bring there>.

## Gaps
- <what the mission needs and no good source covers yet>
```
High-trust only: primary sources, recognized experts, well-moderated communities; marketing dressed as education stays out. Every entry is annotated. Prune what turned out wrong, shallow or off-mission: five sharp sources beat thirty.

## learning-records/NNNN-<slug>.md
```markdown
# <what was learned or established>

<1 to 3 sentences: what the learner now knows (or already knew), and why it changes what to teach next.>

Evidence: <the question answered, the exercise done, the prior experience stated>
```
Number by the highest existing plus one. Write one when the learner **shows** understanding of something non-trivial, states prior knowledge (record its depth too), has a misconception corrected (high value: it predicts the next stumble), or the mission shifts. Not for material that was only covered, not for what `GLOSSARY.md` already says, and not as a session log. When a later record contradicts an earlier one, mark the old one `Status: superseded by NNNN` instead of deleting it.

## GLOSSARY.md
```markdown
# <topic> glossary

**<Term>**: <what it is, in one or two sentences>.
_Avoid_: <the looser words for the same thing>
```
Add a term only once the learner uses it correctly. Be opinionated: pick one word per concept and list the rest under _Avoid_. Use glossary terms inside other definitions. Lessons follow the glossary. Revise a definition in place when understanding deepens.
