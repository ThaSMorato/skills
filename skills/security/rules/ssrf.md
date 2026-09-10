> Part of the `security` skill. CWE-918 · OWASP A10.

# Server-side request forgery

**The tell.** The server issues an HTTP (or other protocol) request to a URL, host, or port that came from the caller — webhook registration, "import from URL", link preview, avatar fetching, PDF or screenshot rendering.

**Failure scenario.** The URL is `http://169.254.169.254/latest/meta-data/iam/security-credentials/`. The server fetches it from inside the trust boundary and returns the cloud instance credentials in the response body. Internal admin panels, databases exposed on a private network, and `localhost` health endpoints are reachable the same way.

**The fix.** Allow-list what may be reached: schemes (`https` only), and hosts or domains. Resolve the hostname and verify the resulting **IP** is public before connecting — private ranges, loopback, link-local and IPv6 equivalents must be rejected. Disable redirect following, or re-validate the target after every redirect, since a public host can redirect to an internal one.

**Watch for.** DNS rebinding (validate at connect time, not only at parse time), the response body being returned to the caller (which turns blind SSRF into full read), and non-HTTP schemes like `file:` and `gopher:`.

**Not a finding when.** The target is a constant or comes from a closed configured set.
