---
description: A request the ui description should catch.
tags: [description, fires]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

I am building this delete button for a settings page. Is it usable and accessible?

```jsx
<div className="btn red" onClick={() => api.deleteAccount()}>
  <img src="/trash.svg" />
</div>
```
