> Part of the `ui` skill (see `../SKILL.md`).

# Signal contradicts risk

An **affordance** is what the interface lets a user do; a **signifier** is the perceivable cue that says it can be done, and how (a button's weight, its color, its position, its label, being the default). The cue sets how inviting an action looks, so it has to match how safe the action is: the safe, intended path signaled strongly, the careful one signaled with caution, the harmful one not signaled at all.

**The tell.** The strength of the cue contradicts the risk of the action:
- a destructive or irreversible action (delete, revoke, publish, pay) styled as the primary button, or the same as its safe neighbour ("Delete project" next to "Archive project", same color, same weight);
- a risky option preselected, or offered as the default value;
- the dangerous action placed where the safe one usually is (the right-hand primary slot, the Enter key);
- a label that names the mechanism, not the consequence ("Confirm", "OK") on an action that destroys data;
- the safe path harder to reach than the risky one.

**Failure scenario.** A user who means to archive a project clicks the highlighted button on the right, because that is where "continue" always is, and deletes it. A user accepts the preselected "share with everyone in the organization" because the default looked like the recommendation.

**The fix.** Sort the screen's actions by risk, then signal each accordingly:
- **Safe and intended**: the strongest cue (primary style, the default, the obvious position).
- **Legitimate but needs care**: a weaker cue (secondary style), a label that names the consequence ("Delete 240 files"), and a confirmation or undo (`rules/late-error.md` on confirmations).
- **Harmful or unintended**: no cue on the main path; separate it (a danger zone, a typed confirmation), or remove it.

Never let color carry the difference alone (`rules/color-contrast.md`): the label and the position say it too.
