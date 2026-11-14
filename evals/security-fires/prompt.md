---
description: A request the security description should catch.
tags: [description, fires]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

Is this safe?

```js
app.get('/search', async (req, res) => {
  const rows = await db.query(`SELECT * FROM products WHERE name LIKE '%${req.query.q}%'`)
  res.send(`<h1>Results for ${req.query.q}</h1>` + rows.map(r => r.name).join('<br>'))
})
```
