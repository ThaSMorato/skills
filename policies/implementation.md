# Implementation checks
Before editing, check installed dependencies against the lockfile and the repo's package-manager workflow; report missing dependencies and use the declared installation command when authorized. Read the installed-version library documentation and plan-local references before using a library API.

Run SI tests through a test-runner subagent when delegation is available: give exact commands, cwd and host/container context; it returns command, exit status, counts and concise failure evidence, keeping full logs in scratch. A test-runner never fixes code, calls a stage, or delegates again. If subagents are unavailable, run locally and retain the same summary and log paths. Do not claim a fan-out occurred if it did not.

At every SI stop offer compact text that preserves ticket, feature paths, plan revision/hash, progress path, next SI, decisions, learned facts and failing evidence; discard completed diffs and full test logs. Continuous mode applies only to SIs within this stage, never later stages.

Final verification includes the executable build artifact: start or load the built dist/package, exercise a representative entry point and confirm required runtime assets and env/config are present. A type check alone is not a build smoke test. Record exact command and result or mark it unverified. Update affected feature docs before reporting completion.
