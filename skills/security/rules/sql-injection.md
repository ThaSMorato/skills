> Part of the `security` skill. CWE-89 · OWASP A03 Injection.

# SQL injection

**The tell.** A query is assembled as a string that contains a value the caller supplied — concatenation, interpolation, an f-string, a template literal, a `format`. Also: an ORM escape hatch (`raw`, `execute`, `whereRaw`, `literal`) receiving anything but a constant.

**Failure scenario.** A search field receives `' OR 1=1 --`; the `WHERE` clause becomes a tautology and the endpoint returns every row, across every tenant. With stacked statements or a writable connection, it escalates to data modification or file access.

**The fix.** Parameterized queries or bound statements, always — the driver sends the query and the values separately, so no value can become syntax. Where the *structure* is dynamic (a sortable column, a table name), a parameter cannot help: whitelist against a fixed set of allowed identifiers and reject anything else.

**Watch for.** Escaping functions used instead of binding (they are per-context and easy to misuse), `LIKE` patterns built by concatenation, `IN` clauses assembled by joining a list, and ORM helpers that accept a raw fragment for one argument only.

**Not a finding when.** The ORM parameterizes by default and the value goes through the normal query builder. Confirm before flagging — the safe path is the common path in most stacks.
