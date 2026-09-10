> Part of the `security` skill. CWE-434 · OWASP A04/A05.

# Unrestricted file upload

**The tell.** An upload handler that accepts any content type, trusts the client-declared MIME type or the filename extension, has no size cap, or stores files inside the web root under a caller-controlled name.

**Failure scenario.** A profile-picture endpoint accepts `avatar.php` because it only checked the `Content-Type` header the client sent. The file lands in a served directory, and a request to it executes code on the server. Even without execution, an uploaded HTML or SVG file served from the application's origin gives stored XSS with full same-origin access.

**The fix.**
- **Validate by content**, not by name or declared type — sniff the actual format and match it against an allow-list.
- **Generate the stored name** yourself; never reuse the client's path or extension.
- **Store outside the web root**, or in object storage, and serve through a handler that sets a correct `Content-Type` and `Content-Disposition`.
- **Cap size** before buffering, and cap total storage per account.
- **Serve user content from a separate origin** so a rendered file cannot reach the application's session.

**Watch for.** Archives that expand far beyond their compressed size, or that contain traversal paths; image processors invoked on untrusted files, which have their own memory-safety history; and SVG treated as an image when it is a script container.
