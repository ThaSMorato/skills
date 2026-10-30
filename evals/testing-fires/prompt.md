---
description: A request the testing description should catch.
tags: [description, fires]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

What should I test for this function, and how?

```ts
export function applyDiscount(cart: Cart, code: string, now: Date): Cart {
  const coupon = COUPONS[code]
  if (!coupon || coupon.expiresAt < now) return cart
  return { ...cart, total: Math.max(0, cart.total - coupon.amount) }
}
```
