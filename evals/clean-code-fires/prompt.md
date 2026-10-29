---
description: A request the clean-code description should catch.
tags: [description, fires]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

Refactor this function so it reads well, then show the result:

```js
function proc(d, f) {
  // loop
  let r = []
  for (let i = 0; i < d.length; i++) { if (f) { r.push(d[i] * 2) } else { r.push(d[i]) } }
  return r
}
```
