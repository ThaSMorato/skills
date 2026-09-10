> Part of the `security` skill. CWE-502 · OWASP A08.

# Unsafe deserialization

**The tell.** Untrusted bytes are turned into live objects by a format that can encode types or behaviour: `pickle`, `Marshal.load`, Java native serialization, PHP `unserialize`, YAML loaded unsafely, or any library documented as reconstructing arbitrary classes.

**Failure scenario.** A serialized session cookie is replaced with a crafted payload that, on reconstruction, invokes a chain of methods ending in process execution. No injection point in the application's own logic is needed — the deserializer does the work.

**The fix.** Do not deserialize untrusted input with those formats. Use a data-only format — JSON parsed into plain structures, or a schema-validated decoder — and construct your own objects from the validated data. Where the format supports it, use the safe loader explicitly (`yaml.safe_load`, a restricted `ObjectInputStream` filter).

**Watch for.** Signature verification that happens *after* parsing (too late), caches and queues carrying serialized objects between services, and "it's internal" trust that a compromised neighbour dissolves.

**Not a finding when.** The bytes come from a source you sign and verify **before** deserializing, and the format is data-only.
