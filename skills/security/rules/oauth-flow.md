> Part of the `security` skill. CWE-352, CWE-601, CWE-287 · OWASP A07.

# OAuth / OpenID Connect flow weaknesses

**The tell.** An OAuth or OIDC login or authorization flow that omits one of the parameters that bind the response to the request: no `state` (or a `state` that is not checked on the callback), no PKCE (`code_challenge` / `code_verifier`) for a public client or a SPA, a `redirect_uri` matched by prefix or pattern instead of exactly, an ID token accepted without checking `iss`, `aud`, expiry and `nonce`, or the implicit flow (tokens in the URL fragment).

**Failure scenario.** Without `state`, an attacker starts a login with their own account, captures the callback URL and gets a victim to open it: the victim's session is now logged in as the attacker, and whatever the victim saves (a card, a document) lands in the attacker's account. Without PKCE, an authorization code intercepted on a mobile redirect or in a log is exchanged by whoever holds it. With a loose `redirect_uri`, the code is delivered to an attacker-controlled path on an allowed domain.

**The fix.**
- **Authorization code flow with PKCE** for every client, public or confidential; never the implicit flow.
- **A random `state`** bound to the user's session, checked on the callback, single use.
- **Register exact redirect URIs** and compare them exactly.
- **Validate the ID token**: signature (see `jwt-validation.md`), `iss`, `aud` equals your client id, `exp`, and the `nonce` you sent.
- Prefer a maintained library that does all of this over hand-rolled flow code.

**Watch for.** `state` generated but compared to nothing; PKCE implemented with the `plain` method; the access token stored in `localStorage` in a page that also renders user content (`xss.md`).
