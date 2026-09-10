> Part of the `security` skill. CWE-639 / CWE-862 / CWE-863 · OWASP A01.

# Broken access control

The most common and most damaging class, and the one least visible in a diff — because the vulnerability is usually a **missing** line, not a wrong one.

## Object-level (IDOR) — CWE-639
**The tell.** A record is loaded by an identifier taken from the request, and nothing verifies the caller may see *that* record: `findById(params.id)` with no ownership or tenancy predicate.

**Failure scenario.** `GET /invoices/1041` returns another customer's invoice. Sequential ids make enumeration trivial; UUIDs slow it down and fix nothing, because the check is still absent.

**The fix.** Scope every lookup by the caller's authority — query by `(id, owner)` or through a tenant-scoped repository, so an unauthorized record cannot be returned at all. Enforce it at the data-access boundary rather than per-handler, so a new endpoint inherits the rule instead of having to remember it.

## Function-level — CWE-862
**The tell.** An endpoint checks that the caller is *authenticated* and never that they are *authorized*. Admin routes distinguished only by path, or a permission check present on the UI and absent on the API.

**Failure scenario.** A support role calls the delete-user endpoint directly and it succeeds, because the button was hidden but the route was not guarded.

**The fix.** Deny by default: the framework requires an explicit permission declaration per route, and a route without one does not serve. Check on the server for every state change, never only where the UI decides what to render.

**Watch for.** Access checked on the read path and not the write path, bulk endpoints that skip the per-item check, and second-order access — an id nested inside a payload that is trusted because the top-level id was verified.
