> Part of the `security` skill. CWE-22 · OWASP A01 Broken Access Control.

# Path traversal

**The tell.** A filesystem path is built from caller-supplied input — a download handler, an upload target, a template or locale name, an archive being extracted.

**Failure scenario.** A `file` parameter arrives as `../../../../etc/passwd`, or as an absolute path. The handler reads outside its intended directory and returns configuration, keys, or source. On the write side, it overwrites a file the service trusts.

**The fix.** Do not build paths from input where you can avoid it: map an opaque identifier to a path through a lookup you control. When you must, resolve the final path to its canonical form and verify it is still inside the intended root **after** resolution — checking for `..` in the raw string misses URL-encoded forms, alternate separators, and symlinks.

**Watch for.** Archive extraction (a `zip`/`tar` entry may carry `../` in its name — the "zip slip" case), symlinks in an extracted tree, and null bytes or unicode variants used to defeat suffix checks.

**Not a finding when.** The path is fully derived from a closed enum or a database-issued identifier that never reaches the filesystem verbatim.
