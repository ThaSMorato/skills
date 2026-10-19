# Acceptance evidence
Use `http` for API-only criteria: execute a reproducible `.http` request against the running backend with real authorized test data, record request block ID, status and relevant response evidence with secrets redacted. Store the file beside the acceptance report. A file that was only written is not evidence of execution. Add `http` to by_verdict. Visual criteria still need browser evidence.

Build a dependency DAG of flows before executing; distinguish `blocked` (a prerequisite failed or is unavailable, name it) from `failed` (executed with a mismatching result). Record both counts; independent flows may still be checked after a failure. Never claim blocked work passed. Cycles are reported as invalid prerequisites. Gate success requires zero failed and blocked items and explicit disclosure of all unverified items.

An optional owner-requested exploratory browser pass after the planned suite suggests new cases only; it neither silently expands the agreed ACs nor fixes code. Mutation testing belongs to test review, never acceptance. Absorb only delivered passing ACs into living feature rules as described in the living-docs policy.
