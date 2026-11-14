> Part of the `security` skill. CWE-384 / CWE-613 · OWASP A07.

# Session management

**The tells.** The session identifier survives a login or a privilege change; sessions never expire; logout clears the client and leaves the server-side session valid; a token carries authority with no revocation path; cookies missing `HttpOnly`, `Secure`, or `SameSite`.

**Failure scenario: fixation.** The attacker plants a known session id in the victim's browser, the victim logs in, the id is kept, and the attacker's pre-planted session is now authenticated as the victim.

**Failure scenario: no revocation.** A stolen long-lived JWT stays valid until its expiry no matter how fast the theft is noticed, because nothing consults server state.

**The fix.**
- **Rotate the identifier** on login, on logout, and on every privilege change.
- **Expire** on both an idle timeout and an absolute lifetime.
- **Invalidate server-side on logout**, and on password change invalidate every other session.
- **Cookie flags:** `HttpOnly`, `Secure`, and `SameSite=Lax` or stricter.
- **Stateless tokens need a revocation story**: short expiry plus a refresh token that is checked against server state, or a deny-list. "It expires in a week" is not a revocation story.
- **A sealed cookie is a stateless token too.** A session encrypted into the cookie itself (Iron Session, the cookie session store of Rails or Express) is decrypted on every request and nothing on the server is consulted, so clearing it on logout clears only the client: a stolen copy opens the session until its `maxAge`. Its revocation story comes from what it holds (a refresh token whose family the API revokes), a bounded `maxAge`, and a sealing secret that can be rotated by version, which drops every session at once. A session an admin must end individually and at once needs a server-side session id instead.
- **Rotate the refresh token atomically.** Consuming it is one conditional write (`UPDATE ... SET used_at = now() WHERE jti = ? AND used_at IS NULL`, continue only if one row changed); a read followed by a write lets two requests spend the same token, the shape in `race-conditions`. A consumed token that comes back means two parties hold a copy: revoke the whole family, since the server cannot tell the owner from the thief.
- **Survive a concurrent refresh.** Two tabs, or a retry after a dropped connection, send the same refresh almost together, and the second, by the reuse rule, logs out a user who did nothing wrong. Allow a short grace window for the token that was just replaced, and only that one, or better, answer the same pair already issued (an idempotent refresh). The first defense is a single-flight refresh on the client, with the other requests waiting for its result; behind a BFF, the BFF is that client.

**Watch for.** Session ids in URLs (they leak through referrers and logs), tokens stored in `localStorage` where any XSS reads them, and refresh tokens with no rotation or reuse detection.
