> Part of the `security` skill. CWE-915 · OWASP A04/A08.

# Mass assignment

**The tell.** A request body is bound wholesale onto a persisted model or entity — `update(params)`, `Object.assign(user, req.body)`, a spread of the payload into a create call — with no field whitelist.

**Failure scenario.** A profile-update endpoint legitimately accepts `name` and `email`. The attacker adds `"role": "admin"` or `"accountBalance": 999999` to the same request. The field was never in the form, was never documented, and is written anyway.

**The fix.** Bind to an explicit input type that contains **only** the fields this operation may change, and map from it to the entity. Framework whitelists (strong parameters, DTO validation with unknown-field rejection, an explicit `select` of assignable columns) do the same job — the requirement is that the allowed set is stated positively somewhere.

**Watch for.** Nested objects and relations bypassing a flat whitelist, `PATCH` handlers that iterate the payload's keys, and admin-only fields that share a model with a user-facing endpoint.

**Not a finding when.** The handler reads named fields individually, or the framework rejects unknown properties and the allowed set is declared.
