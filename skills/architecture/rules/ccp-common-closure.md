> Part of the `architecture` skill. Component cohesion.

# CCP — Common Closure Principle

**Gather into a component the classes that change for the same reasons and at the same times. Separate those that change for different reasons.**

This is the Single Responsibility Principle restated for components: a component should have **one reason to be redeployed**. Most of the cost of a change is not writing the code — it is revalidating and redeploying what the change touched. CCP minimises how many components a single requirement change disturbs.

## The tell
- One requirement change forces edits across several components — the component-scale **Shotgun Surgery**.
- One component is redeployed for unrelated reasons, several times a week — the component-scale **Divergent Change**.
- The change log for a component reads like two different products.

## What to do
Partition by **axis of change**, not by technical layer. "All the controllers" is a temporal/technical grouping; "everything that changes when the pricing rules change" is a closure grouping. When you cannot yet tell what the axes of change are, you cannot yet draw the boundary — which is the reason boundaries are decided after the feature specs, not before.

## The caveat
CCP favours **developability** over reusability: it will merge things a reuser would rather have separate. Young systems should lean this way; mature, widely-consumed ones lean toward REP/CRP. See `cohesion-tension.md`.
