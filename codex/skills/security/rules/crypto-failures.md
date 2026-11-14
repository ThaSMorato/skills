> Part of the `security` skill. CWE-327 / CWE-330 / CWE-916 · OWASP A02.

# Cryptographic failures

**The tells.** MD5 or SHA-1 used for anything security-bearing; a general-purpose fast hash used for passwords; `Math.random`, `rand`, or a seeded PRNG generating a token; ECB mode; a hardcoded or reused IV or nonce; a homegrown encryption routine; TLS verification disabled.

**Failure scenario: password hashing.** Passwords stored as unsalted SHA-256. A database leak becomes a full credential dump within hours on commodity GPUs, and the reuse of those credentials elsewhere is the real damage.

**Failure scenario: weak randomness.** A password-reset token from a non-cryptographic PRNG seeded by the clock. An attacker who knows roughly when the reset happened enumerates the small space and takes the account.

**The fix.**
- **Passwords:** a slow, tuned password KDF with a per-password salt, never a general-purpose hash. Argon2id by default; scrypt is also memory-hard. bcrypt is only CPU-hard (about 4 KB per guess, so cheap to parallelize on a GPU) and truncates at 72 bytes: keep it for a legacy system or a stack with no trustworthy Argon2, reject a longer password instead of truncating it in silence, and avoid pre-hashing to get around the limit. PBKDF2 only where FIPS-140 compliance requires it. The OWASP minimums:
  - Argon2id `m=19 MiB, t=2, p=1` (or the equivalent `m=46 MiB, t=1, p=1`);
  - scrypt `N=2^17, r=8, p=1`;
  - bcrypt a cost of 10 or more.

  Tune them on the production hardware, to a few hundred milliseconds per verification that the login survives under load. The parameters live in the hash string, so when they rise, verify with the old ones and rehash on the next successful login.
- **Tokens, salts, ids:** the platform's cryptographically secure generator, always.
- **Encryption:** an authenticated mode (AES-GCM, ChaCha20-Poly1305) through a maintained library, with a unique nonce per message. Never design the construction yourself.
- **Transport:** TLS with certificate verification on; a disabled verification flag is a finding regardless of the surrounding comment.
- **Key management:** keys from a secret store, rotatable, never alongside the data they protect.

**Watch for.** Encryption used where authentication was needed (encrypted-but-malleable data), comparison of MACs with `==`, and "we hash it twice" as a substitute for a KDF.
