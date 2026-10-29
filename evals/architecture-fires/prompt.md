---
description: A request the architecture description should catch.
tags: [description, fires]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

Our `orders` module imports the payments database client directly in 14 files, and we want to be able to swap the payment provider next quarter. Where should the boundary go, and what seam would you put in? Answer with the module you would add and which side of it each of those 14 files lands on.
