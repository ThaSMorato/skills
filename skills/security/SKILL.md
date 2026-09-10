---
name: security
description: A self-contained catalog of security weaknesses at the level you can actually see in code — injection, access control, crypto, secrets, session handling, SSRF, deserialization, upload and rate-limit failures, plus LLM-specific risks — each with its tell, its concrete failure scenario, and its fix. Use when reviewing a diff or a feature for security, threat-modelling a design, or when someone asks "is this safe".
---

# Security

Two vocabularies matter here, and they do different jobs.

**OWASP Top 10 is a taxonomy, not a scanner.** Categories like *Insecure Design* or *Security Logging Failures* describe classes of risk across a whole system; you cannot judge them from a changed hunk. Use them to **group and report** findings, and to steer design review.

**CWE-level weaknesses are the scannable unit.** "Is this query built by string concatenation" is answerable in one line of a diff. Those are the rules below.

Read a rule file **only when its row matches**. Every finding must carry three things or it does not ship: **the rule it violates**, **a concrete failure scenario** (the input, and what an attacker gets), and **the fix**. A finding without a failure scenario is a guess dressed as a result.

## Injection and untrusted input
| Weakness | Tell | Rule |
|---|---|---|
| SQL injection (CWE-89) | query assembled from a string containing user input | `rules/sql-injection.md` |
| Command injection (CWE-78) | shell invoked with interpolated input | `rules/command-injection.md` |
| Cross-site scripting (CWE-79) | untrusted value reaches HTML/JS without contextual escaping | `rules/xss.md` |
| Path traversal (CWE-22) | user input used to build a filesystem path | `rules/path-traversal.md` |
| SSRF (CWE-918) | server fetches a URL the user supplied | `rules/ssrf.md` |
| Unsafe deserialization (CWE-502) | untrusted bytes turned into objects | `rules/unsafe-deserialization.md` |
| XXE (CWE-611) | XML parsed with external entities enabled | `rules/xxe.md` |
| Open redirect (CWE-601) | redirect target comes from the request | `rules/open-redirect.md` |
| Mass assignment (CWE-915) | request body bound wholesale onto a model | `rules/mass-assignment.md` |

## Access control and identity
| Weakness | Tell | Rule |
|---|---|---|
| Broken object-level authorization (CWE-639) | record fetched by id with no ownership check | `rules/broken-access-control.md` |
| Missing function-level authorization (CWE-862) | endpoint with authentication but no permission check | `rules/broken-access-control.md` |
| Authentication weaknesses (CWE-287, 307, 521) | no lockout, weak password rules, guessable reset | `rules/authentication.md` |
| Session management (CWE-384, 613) | session id kept across privilege change, never expires | `rules/session-management.md` |
| CSRF (CWE-352) | state-changing request authorized only by a cookie | `rules/csrf.md` |

## Data protection
| Weakness | Tell | Rule |
|---|---|---|
| Cryptographic failures (CWE-327, 330, 916) | outdated algorithm, non-cryptographic randomness, fast password hash | `rules/crypto-failures.md` |
| Hardcoded secrets (CWE-798) | key, token or password committed to the repo | `rules/hardcoded-secrets.md` |
| Sensitive data exposure (CWE-200, 532) | secrets or PII in logs, errors, or responses | `rules/sensitive-data-exposure.md` |

## Resource and operational safety
| Weakness | Tell | Rule |
|---|---|---|
| Missing rate limiting (CWE-770) | expensive or abusable endpoint with no cap | `rules/rate-limiting.md` |
| Unrestricted upload (CWE-434) | file accepted without type, size, or storage constraints | `rules/unrestricted-upload.md` |
| TOCTOU / race conditions (CWE-367, 362) | check and use split across a non-atomic gap | `rules/race-conditions.md` |
| Vulnerable dependencies (CWE-1104) | known-vulnerable or unmaintained package | `rules/vulnerable-dependencies.md` |
| Insecure defaults and configuration (CWE-16) | debug on, permissive CORS, default credentials | `rules/insecure-configuration.md` |

## LLM-backed features
| Weakness | Tell | Rule |
|---|---|---|
| Prompt injection (LLM01) | untrusted text reaches the model with authority | `rules/llm-prompt-injection.md` |
| Insecure output handling (LLM02) | model output executed, rendered, or queried without checks | `rules/llm-output-handling.md` |

## Reporting
Group findings by their OWASP category, rank by **exploitability × impact**, and use one shared scale so severities are comparable across reviewers:

| Severity | Means |
|---|---|
| **critical** | remotely exploitable now, with data loss, RCE, or auth bypass |
| **high** | exploitable with a precondition an attacker can reach (an account, a role, a known id) |
| **medium** | needs an unlikely precondition, or the impact is limited to one user's data |
| **low** | hardening; no path to impact today, but it removes a step from a future chain |

## Calibration
This catalog is a set of **heuristics with a burden of proof**, not a checklist to satisfy. A narrow reviewer is primed to find its own subject, which makes false positives the dominant failure mode here — you will be tempted to report something because the file is a security file. Two guards:

- **No failure scenario, no finding.** If you cannot state the input and what the attacker obtains, you have found a pattern, not a vulnerability.
- **The framework may already handle it.** Parameterized queries by default, template auto-escaping, CSRF middleware, an ORM that whitelists attributes — check what is actually configured before flagging. Read the repo's stack guide when one exists; the safe idiom is stack-specific and is exactly what a generic catalog cannot know.
