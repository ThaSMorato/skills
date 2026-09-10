> Part of the `security` skill. CWE-601 · OWASP A01.

# Open redirect

**The tell.** A redirect destination is taken from the request — a `next`, `returnUrl`, `redirect_uri` or `continue` parameter — and used without validation.

**Failure scenario.** A phishing link points at the real, trusted domain with `?next=https://evil.example/login`. The victim sees a legitimate host, authenticates, and is bounced to a copy of the login page. In an OAuth flow, a permissive `redirect_uri` sends the authorization code itself to the attacker.

**The fix.** Redirect only to paths, never to caller-supplied absolute URLs: accept a relative path and reject anything containing a scheme or a host. Where cross-origin redirects are genuinely needed, match against an allow-list of exact origins. For OAuth, register redirect URIs and compare by exact string.

**Watch for.** Protocol-relative URLs (`//evil.example` is absolute), backslash and unicode variants that a naive prefix check misses, and validation applied before decoding rather than after.

**Not a finding when.** The destination is chosen from a closed set the server controls.
