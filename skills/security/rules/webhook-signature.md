> Part of the `security` skill. CWE-345 · OWASP A08.

# Unverified webhook

**The tell.** An endpoint that receives events from a third party (payments, source hosting, messaging) acts on the body without verifying that the sender is who it claims to be: no signature check, a signature checked against the **parsed** body instead of the raw bytes, a plain `==` comparison of the signature, or no check of the event's timestamp.

**Failure scenario.** Anyone who finds the URL posts `{"type": "payment.succeeded", "order": 123}`. The handler marks order 123 paid and ships it. Or a real, signed event captured once is replayed a hundred times, and each replay credits the account again.

**The fix.**
- **Verify the provider's signature** (usually an HMAC of the raw request body with a shared secret) **before** parsing or acting, and reject on mismatch.
- **Compute it over the raw bytes.** Re-serializing a parsed body changes whitespace and key order, so a correct signature fails, and the usual "fix" is to stop checking.
- **Compare in constant time** (`hmac.compare_digest`, `crypto.timingSafeEqual`, `ActiveSupport::SecurityUtils.secure_compare`).
- **Reject stale timestamps** (a tolerance of minutes) and **deduplicate by event id**, so a replay does nothing the second time.
- Keep the secret out of the repo (`hardcoded-secrets.md`), and use the provider's official verification helper when one exists.

**Watch for.** Verification disabled "for local testing" by an environment flag that is also unset in production; an IP allow-list used instead of the signature (provider ranges change and are shared); handlers that do their work before the check "because it is fast".
