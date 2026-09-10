> Part of the `security` skill. CWE-1104 · OWASP A06.

# Vulnerable and unmaintained dependencies

**The tell.** A dependency with a published advisory affecting the pinned version; a package that no longer receives security fixes; a transitive dependency nobody has looked at; a lockfile that has drifted from the manifest.

**Failure scenario.** A widely used parser has a remote-code-execution advisory. The application never calls the vulnerable path directly, but a transitive dependency does, and the request path reaches it. The exploit is public, so the window between disclosure and mass scanning is measured in days.

**The fix.** Run the ecosystem's own audit tooling in CI and fail the build on advisories above a chosen severity. Keep the lockfile committed and current. `/audit-deps` runs this properly — the native tool is authoritative and offline, and no reviewer's memory should be substituted for it.

**Every vulnerability finding must cite an advisory id** (`CVE-…`, `GHSA-…`, `OSV-…`). A model's recollection of which versions are affected is exactly the kind of claim that is confidently wrong, and an uncited CVE is worse than silence because it looks verified.

**Watch for.** Advisories that only apply to a configuration you do not use — say so rather than dropping them silently. And unmaintained is not the same as unsafe: a small, complete, stable library with no commits in three years may be healthy. Judge by unanswered security reports, unpatched known issues, and support for current runtimes — not by the date of the last commit.
