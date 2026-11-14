> Part of the `code-smells` skill (see `../SKILL.md`).

# Business Rule at the Edge

**Tell:** an artifact the framework runs around the handler decides a business question itself. The artifacts are the transport edge, like the controller, and each has a transport job:

| Artifact | Its job |
|---|---|
| guard, `before_action`, auth middleware | let the request through or not (authenticated, role) |
| pipe, validator, binder | check and convert the shape of the input |
| interceptor, around filter, middleware | wrap the handler (logging, timing, the response envelope) |
| exception filter, error middleware | turn an exception into a response |

The smell is one of them answering a domain question in its own body: "has this user confirmed their email?", "does this user own the channel?", "is the order still editable?", with the query and the rule written there.

**Why it hurts:** the artifact runs on every request and already has the request in hand, so the rule lands there. That is also the typical shortcut of generated code. The rule is then reachable only through HTTP: a job, a queue consumer or a CLI that needs it duplicates it, and testing it means starting the HTTP stack.

**Fix:** the artifact calls the service that owns the rule and acts on its answer (`if (!await channels.isOwner(user, id)) throw new ForbiddenException()`); the rule, its query and its test live in the service. The artifact keeps its transport job. The `architecture` skill's `rules/detail-web.md` holds the same line for the controller.
