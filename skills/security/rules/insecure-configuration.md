> Part of the `security` skill. CWE-16 · OWASP A05 Security Misconfiguration.

# Insecure defaults and configuration

**The tell.** Debug mode or verbose errors enabled outside development; default or sample credentials still accepted; an admin interface reachable from the internet; permissive CORS (`*` with credentials, or reflecting the request's origin); directory listing on; security headers absent; a cloud bucket or database exposed publicly.

**Failure scenario.** A framework's debug page is left on in production. An error reveals the stack, the settings module, and the secret key — and with the signing key, session cookies can be forged for any user. No exploit code is needed; the information is served on request.

**The fix.**
- **Differ by environment, explicitly.** Production configuration sets the safe value rather than inheriting a development default.
- **CORS by allow-list** of exact origins; never reflect the caller's origin while allowing credentials.
- **Set the baseline headers** — HSTS, `X-Content-Type-Options`, a Content-Security-Policy, frame protection.
- **Remove sample users, seeded admin accounts and demo endpoints** from anything deployed.
- **Verify the deployed state**, not the file in the repo; the gap between them is where this class lives.

**Watch for.** A permissive setting added "temporarily" to unblock local work and merged; infrastructure defaults that are open until closed; and a second environment (staging with production data) held to a lower standard than the one being reviewed.
