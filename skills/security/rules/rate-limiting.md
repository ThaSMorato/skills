> Part of the `security` skill. CWE-770 · OWASP A04 Insecure Design.

# Missing rate limiting

**The tell.** An endpoint that is expensive (a report, a search, an export, an LLM call), abusable (login, password reset, invite, OTP), or that costs money per call, with no cap per caller or per account.

**Failure scenario.** An unthrottled OTP-send endpoint is called in a loop against a list of numbers. The attacker's cost is zero; the operator's is a five-figure SMS bill overnight. On a login endpoint, the same absence turns a credential dump into a live credential-stuffing run.

**The fix.** Limit on the dimension that matters — per account for account-scoped abuse, per IP or per key for anonymous traffic, and a global cap as a circuit breaker. Prefer a shared store so the limit survives multiple instances. Pair the limit with a **cost cap** for anything that spends money per call, because a rate that is fine for latency can still be ruinous for billing.

**Watch for.** A limit on the web form and none on the API or mobile path; a per-IP limit that a distributed attempt pattern walks past; unbounded pagination or filter parameters that make one request expensive; and no limit on the *response* side, where an endpoint that returns unbounded rows is a denial of service against yourself.

**Not a finding when.** A gateway or edge layer enforces it and you can point at the configuration.
