> Part of the `security` skill. CWE-829, CWE-353 · OWASP A08.

# Third-party script without integrity

**The tell.** A page loads a script or stylesheet from a host you do not control (a CDN, a vendor widget) with no `integrity` attribute, or pins it to a moving version (`@latest`, a major-only range) so the content can change under the same URL.

**Failure scenario.** The CDN, or the package it serves, is compromised, and the file at the same URL now also sends every keystroke on the checkout page to the attacker. Every page that includes it runs the new code with the page's full privileges: its cookies, its DOM, its forms.

**The fix.**
- Add **`integrity="sha384-…"` and `crossorigin="anonymous"`** to every `<script>` and `<link>` loaded from another origin, pinned to an **exact version**; the browser refuses a file whose hash changed.
- Prefer **self-hosting** what you can, as part of the build.
- Back it with a **Content-Security-Policy** that allows scripts only from the origins you list.
- For vendor scripts that change by design (analytics, chat widgets) SRI cannot be used: isolate them (an iframe on another origin, no access to the sensitive pages) and treat them as trusted code in the threat model.

**Watch for.** An integrity hash copied once and a version bumped later without updating it, which breaks the page and invites removing the attribute; build tooling that injects third-party tags without SRI.
