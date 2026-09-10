> Part of the `architecture` skill. Component cohesion.

# The tension between REP, CCP and CRP

The three cohesion principles **cannot all be satisfied at once**. They pull the same boundary in different directions, and the useful skill is knowing which one to sacrifice right now.

```
            REP (release/reuse together)
                   /        \
   too many components      /
   too many releases       /
                  /        \
    CCP ————————————————————— CRP
 (change together)       (reuse together)
  giving up reuse         too many changes
                          reach the consumer
```

- Favour **CCP** and you get components that are easy to develop and redeploy, and awkward to reuse.
- Favour **REP + CRP** and you get components that are pleasant to consume, and a change that ripples across many of them.

## The rule of thumb
**A young project sits on the CCP side; a mature one drifts toward REP/CRP.** Early on, nobody is reusing anything and every day is a redeploy — developability is what matters. As consumers appear and the code stabilises, the cost moves to them, and the boundary should follow.

This means the right partitioning **changes over time**, and a component structure that was correct two years ago being wrong today is normal evolution, not neglect.

## How to use this
When a review or an analysis flags a cohesion violation, ask which corner of the triangle the project is currently standing in. A finding that says "this component violates CRP" without saying which trade-off the project chose is noise.
