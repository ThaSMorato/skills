> Part of the `security` skill. CWE-384 / CWE-613 · OWASP A07.

# Session management

**The tells.** The session identifier survives a login or a privilege change; sessions never expire; logout clears the client and leaves the server-side session valid; a token carries authority with no revocation path; cookies missing `HttpOnly`, `Secure`, or `SameSite`.

**Failure scenario — fixation.** The attacker plants a known session id in the victim's browser, the victim logs in, the id is kept, and the attacker's pre-planted session is now authenticated as the victim.

**Failure scenario — no revocation.** A stolen long-lived JWT stays valid until its expiry no matter how fast the theft is noticed, because nothing consults server state.

**The fix.**
- **Rotate the identifier** on login, on logout, and on every privilege change.
- **Expire** on both an idle timeout and an absolute lifetime.
- **Invalidate server-side on logout**, and on password change invalidate every other session.
- **Cookie flags:** `HttpOnly`, `Secure`, and `SameSite=Lax` or stricter.
- **Stateless tokens need a revocation story** — short expiry plus a refresh token that is checked against server state, or a deny-list. "It expires in a week" is not a revocation story.

**Watch for.** Session ids in URLs (they leak through referrers and logs), tokens stored in `localStorage` where any XSS reads them, and refresh tokens with no rotation or reuse detection.
