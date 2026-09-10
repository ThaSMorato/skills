> Part of the `architecture` skill. Details.

# The web is a detail

HTTP is a **delivery mechanism** — one of many the same policy could sit behind: a CLI, a queue consumer, a scheduled job, a gRPC endpoint, a test harness. The web is an I/O device with a fashion cycle, and the policy should not be able to tell which device it is attached to.

## The boundary
Controller and presenter belong to the interface-adapters circle. Their job is conversion, in both directions:

- **Inbound:** take the request, validate its shape, turn it into the use case's own input structure. The use case never sees a request object, a header, a cookie, a session, or a status code.
- **Outbound:** take the use case's output structure and render it — JSON, HTML, a status code, a redirect. The use case never chooses a status code, because a status code is an HTTP idea.

## The tell
- A use case returning a framework response, or taking a request as a parameter.
- HTTP status codes or header names appearing in policy code.
- Validation of business rules living in the controller — the controller may check *shape*; only the policy may check *rules*.
- Business logic reachable only through a route.

## Why it keeps eroding
The framework makes the wrong thing easy: a controller with the logic inline works immediately, and the seam costs a file. The erosion is invisible until the second delivery mechanism arrives — a background job that needs the same behaviour — and the only way to get it is to call the HTTP endpoint from inside the process, or to duplicate the rule.

## The practical test
Can the feature be exercised end to end with no HTTP layer running? If yes, the boundary is real. If the only way to test the rule is through a route, the web is not a detail here — it is the architecture.
