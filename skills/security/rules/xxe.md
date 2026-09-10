> Part of the `security` skill. CWE-611 · OWASP A05.

# XML external entity processing

**The tell.** XML from an untrusted source is parsed with a parser whose external-entity and DTD processing has not been explicitly disabled. Also present in formats built on XML: SVG, SOAP, XLSX, DOCX, RSS.

**Failure scenario.** An uploaded document declares an entity pointing at `file:///etc/passwd` and references it in a field the application echoes back. The parser dereferences it and the file's contents appear in the response. Pointed at an internal URL instead, it becomes SSRF; pointed at a recursive entity, a denial of service.

**The fix.** Disable DTD processing and external entity resolution on every parser instance that touches untrusted input — this is a per-parser setting and defaults vary by library and version. Prefer a format that does not carry this hazard where the choice is yours.

**Watch for.** A parser configured safely in one place and constructed with defaults in another; XML-derived uploads treated as opaque binaries; and libraries that changed their defaults across versions, so an audit of a previous release does not carry over.

**Not a finding when.** The parser is documented to disable DTDs by default in the version in use — verify the version.
