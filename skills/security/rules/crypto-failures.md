> Part of the `security` skill. CWE-327 / CWE-330 / CWE-916 · OWASP A02.

# Cryptographic failures

**The tells.** MD5 or SHA-1 used for anything security-bearing; a general-purpose fast hash used for passwords; `Math.random`, `rand`, or a seeded PRNG generating a token; ECB mode; a hardcoded or reused IV or nonce; a homegrown encryption routine; TLS verification disabled.

**Failure scenario: password hashing.** Passwords stored as unsalted SHA-256. A database leak becomes a full credential dump within hours on commodity GPUs, and the reuse of those credentials elsewhere is the real damage.

**Failure scenario: weak randomness.** A password-reset token from a non-cryptographic PRNG seeded by the clock. An attacker who knows roughly when the reset happened enumerates the small space and takes the account.

**The fix.**
- **Passwords:** a memory-hard, tuned KDF (Argon2id or scrypt) with per-password salt, never a general-purpose hash.
- **Tokens, salts, ids:** the platform's cryptographically secure generator, always.
- **Encryption:** an authenticated mode (AES-GCM, ChaCha20-Poly1305) through a maintained library, with a unique nonce per message. Never design the construction yourself.
- **Transport:** TLS with certificate verification on; a disabled verification flag is a finding regardless of the surrounding comment.
- **Key management:** keys from a secret store, rotatable, never alongside the data they protect.

**Watch for.** Encryption used where authentication was needed (encrypted-but-malleable data), comparison of MACs with `==`, and "we hash it twice" as a substitute for a KDF.


Bcrypt is CPU-hard, not memory-hard; Argon2id and scrypt are memory-hard. OWASP baseline: Argon2id m=19 MiB, t=2, p=1; scrypt N=2^17, r=8, p=1. For legacy bcrypt use cost >=10 and respect the 72-byte input limit without silently truncating passwords. Verify current guidance before changing production parameters.

Source: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
