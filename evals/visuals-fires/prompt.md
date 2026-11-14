---
description: A request the visuals description should catch.
tags: [description, fires]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

Show me this refactor proposal as a picture instead of prose: we split `OrderService` (pricing, persistence and email in one class) into `OrderPricing`, `OrderRepository` and `OrderNotifier`, with `OrderService` left as a thin coordinator.
