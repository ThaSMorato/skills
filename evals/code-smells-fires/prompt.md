---
description: A request the code-smells description should catch.
tags: [description, fires]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

Is this well designed? Point out what is drifting in it:

```ts
class Invoice {
  total(order: Order) {
    let t = 0
    for (const l of order.customer.account.lines) t += l.price * l.qty
    if (order.customer.account.country === 'BR') t *= 1.1
    if (order.customer.account.country === 'US') t *= 1.07
    if (order.customer.account.country === 'DE') t *= 1.19
    return t
  }
}
```
