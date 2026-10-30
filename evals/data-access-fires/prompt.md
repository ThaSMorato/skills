---
description: A request the data-access description should catch.
tags: [description, fires]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

Why is this endpoint slow when a customer has many orders?

```js
app.get('/customers/:id/orders', async (req, res) => {
  const orders = await db.query('SELECT * FROM orders WHERE customer_id = $1', [req.params.id])
  for (const order of orders) {
    order.items = await db.query('SELECT * FROM items WHERE order_id = $1', [order.id])
  }
  res.json(orders)
})
```
