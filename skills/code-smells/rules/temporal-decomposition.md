> Part of the `code-smells` skill (see `../SKILL.md`).

# Temporal Decomposition

**Tell:** modules are structured by order of execution (time) rather than by knowledge — the program's timeline became the code's structure.

The classic example: an app that reads → modifies → writes a file, split into `FileReader`, `Modifier`, `FileWriter`. Reader and Writer both need to know the file format, so that knowledge leaks into both — a leading cause of Information Leakage. Do not confuse this structural smell with temporal *coupling* (a runtime hazard of call order, like `init()` before `use()`).

**Fix:** Decompose by information, not execution order — gather code that shares knowledge even if it runs at different times. Ask "what knowledge does each task need and where should it live?", not "what steps happen, in what order?"
