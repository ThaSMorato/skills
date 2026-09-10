> Part of the `security` skill. CWE-287 / CWE-307 / CWE-521 · OWASP A07.

# Authentication weaknesses

**The tells.** Login with no attempt limiting; password rules that cap length or forbid characters; a reset token that is short, predictable, long-lived, or reusable; credentials compared with a non-constant-time equality; a second factor that can be skipped by calling the next endpoint directly.

**Failure scenario.** An unthrottled login endpoint plus a credential dump gives an attacker unlimited offline-speed guessing against live accounts. Or: a password reset token generated from a timestamp is guessed within its window, and the account is taken over without the password ever being known.

**The fix.**
- **Throttle** by account and by source, with a backoff that survives a distributed attempt pattern.
- **Password rules that match the evidence:** a long minimum, no maximum below what the hash supports, no composition rules, and a check against known-breached passwords. Complexity theatre lowers real entropy.
- **Reset tokens** from a cryptographically secure generator, single-use, short-lived, and invalidated on use and on password change.
- **Compare secrets in constant time**, and return the same response and timing whether or not the account exists.
- **Enforce the second factor server-side** at the step it belongs to, not by hiding the next screen.

**Watch for.** Registration and reset endpoints revealing whether an email exists; rate limits applied to the login form and not to the API or the mobile path; and remember-me tokens that never expire.
