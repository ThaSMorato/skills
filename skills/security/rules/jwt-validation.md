> Part of the `security` skill. CWE-347, CWE-345 · OWASP A07.

# JWT accepted without proper validation

**The tell.** A token is decoded and trusted without all of its checks: the signature is not verified (`decode` instead of `verify`), the algorithm is taken from the token's own header (so `alg: none`, or an RS256 public key used as an HS256 secret, passes), `exp` / `nbf` are ignored, or `iss` and `aud` are not checked, so a token minted for another service is accepted here.

**Failure scenario.** An attacker takes any token, changes `"role": "user"` to `"role": "admin"`, sets `alg` to `none` and removes the signature. A library that honors the header accepts it. Or a token issued by the company's other, less protected service, signed by the same identity provider, is replayed against this API, which never checked `aud`.

**The fix.**
- **Verify the signature with an algorithm fixed by the server**: pass the allowed algorithm list explicitly; never read it from the token.
- **Check `exp` and `nbf`** with a small clock-skew tolerance, and **`iss` and `aud`** against the values this service expects.
- Get keys from the provider's JWKS with caching and rotation, not from a value inside the token (`jku`, `x5u`, `kid` pointing at a URL).
- Keep the lifetime short, and have a revocation story (short access tokens plus refresh tokens you can revoke) for logout and compromised accounts.

**Watch for.** "Decode only" in middleware because another layer "already verified it"; a test suite whose fixture tokens use `alg: none`; a symmetric secret shared by several services, which makes any of them able to mint tokens for all.
