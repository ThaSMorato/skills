> Part of the `security` skill. CWE-200 / CWE-532 / CWE-598 · OWASP A02/A09.

# Sensitive data exposure

**The tells.** A request or response body logged whole; an exception handler that returns the stack trace or the database error to the client; an object serialized to the API with fields the caller should not see (password hash, internal flags, another user's data); tokens or PII in URLs, which land in access logs and referrers.

**Failure scenario.** An auth service logs the full request body on failure "for debugging". Passwords, and later reset tokens, accumulate in a log aggregator that a much larger set of people can read than the database, and log retention outlives the credential.

**The fix.**
- **Serialize by allow-list.** The API response is built from an explicit output shape, not by dumping the entity.
- **Redact at the logger.** A field-name deny-list applied centrally, so a new call site inherits it. Log an identifier, never the payload.
- **Errors:** a generic message and a correlation id to the client; the detail stays server-side.
- **Keep secrets out of URLs**, including query strings on redirects.
- **A one-time link is not a `GET` with a side effect.** A confirmation or reset link sent by email as `GET /confirm?token=...` lands in access logs, browser history and the `Referer`, and the mail provider's link scanner fetches it before the user does, consuming the token. Point the link at a page of the front end that reads the token from the fragment (`#token=`, which reaches neither the server nor the `Referer`) and sends it in a `POST`. If the `GET` stays, it gets `Referrer-Policy: no-referrer`, a redacted query string in the logger, a short single-use token, and a redirect to a result page.
- **A public build-time variable ships to every visitor.** A variable with a bundler's public prefix (`NEXT_PUBLIC_`, `VITE_`, `PUBLIC_`, `REACT_APP_`) is inlined into the browser bundle at build time, so one named like a secret (`NEXT_PUBLIC_API_KEY`, `VITE_DB_PASSWORD`) is published. The server's env module imports `server-only` (or the framework's equivalent), so the build fails when a client component imports it.

**Watch for.** Debug or verbose logging enabled in production configuration; third-party error reporters capturing request bodies by default; and a difference in response or timing that reveals whether a record exists.
