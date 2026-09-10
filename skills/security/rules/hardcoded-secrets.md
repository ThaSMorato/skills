> Part of the `security` skill. CWE-798 · OWASP A05/A07.

# Hardcoded secrets

**The tell.** An API key, token, password, private key, connection string with credentials, or signing secret appears as a literal in source, in a committed config or `.env`, in a Dockerfile, in CI configuration, or in a test fixture that mirrors production.

**Failure scenario.** A cloud key is committed to a public repository. Automated scanners find it within minutes of the push, and the account is used for cryptomining or data exfiltration before anyone reads the notification. Deleting the commit does not help — the value is already collected, and it stays in the history and in every fork.

**The fix.** Secrets come from the environment or a secret manager at runtime, and the repository holds only names and non-secret defaults. Add a scanner to the commit path so this is caught before the push, not after.

**Once it has been committed the value is burned.** Rotate it. Removing the line, amending the commit, or rewriting history does not un-publish it.

**Watch for.** A default value that is a real secret used as a fallback; secrets passed as build arguments and baked into image layers; and long-lived personal tokens in CI where a scoped, short-lived credential would do.

**Not a finding when.** The value is an obvious placeholder or a public identifier — a publishable key, a client id. Say which, so the next reader does not re-flag it.
