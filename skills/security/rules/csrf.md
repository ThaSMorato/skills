> Part of the `security` skill. CWE-352 · OWASP A01.

# Cross-site request forgery

**The tell.** A state-changing request is authorized **only** by an ambient credential the browser attaches automatically — a cookie or HTTP auth — with no token, no origin check, and no `SameSite` restriction. Also: a `GET` that changes state.

**Failure scenario.** A logged-in user visits an unrelated page that auto-submits a form to the application's transfer endpoint. The browser attaches the session cookie, the server sees a valid session, and the transfer happens. The attacker never reads the response and does not need to.

**The fix.** Any one of these, applied consistently — and preferably two:
- **`SameSite=Lax` or `Strict`** on session cookies, which removes the cross-site attachment for the common cases.
- **A synchronizer token** bound to the session, required on every state-changing request, and verified server-side.
- **Origin/Referer validation** against an allow-list for state-changing methods.
- **Bearer tokens in a header** are not attached automatically, so a header-authenticated API is not exposed this way — but only if the same endpoints do not also accept the cookie.

**Watch for.** Framework CSRF middleware disabled for an API route that still accepts cookies; a permissive CORS policy with credentials enabled, which reopens the door; and `GET` endpoints that mutate.
