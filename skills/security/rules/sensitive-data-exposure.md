> Part of the `security` skill. CWE-200 / CWE-532 · OWASP A02/A09.

# Sensitive data exposure

**The tells.** A request or response body logged whole; an exception handler that returns the stack trace or the database error to the client; an object serialized to the API with fields the caller should not see (password hash, internal flags, another user's data); tokens or PII in URLs, which land in access logs and referrers.

**Failure scenario.** An auth service logs the full request body on failure "for debugging". Passwords, and later reset tokens, accumulate in a log aggregator that a much larger set of people can read than the database — and log retention outlives the credential.

**The fix.**
- **Serialize by allow-list.** The API response is built from an explicit output shape, not by dumping the entity.
- **Redact at the logger.** A field-name deny-list applied centrally, so a new call site inherits it. Log an identifier, never the payload.
- **Errors:** a generic message and a correlation id to the client; the detail stays server-side.
- **Keep secrets out of URLs**, including query strings on redirects.

**Watch for.** Debug or verbose logging enabled in production configuration; third-party error reporters capturing request bodies by default; and a difference in response or timing that reveals whether a record exists.
