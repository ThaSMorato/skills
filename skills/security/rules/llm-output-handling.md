> Part of the `security` skill. OWASP LLM02.

# Insecure handling of model output

**The tell.** Model output is executed, rendered, or queried without passing the checks any other untrusted input would face: generated code run, generated SQL executed, generated markup rendered as HTML, a generated path or URL used directly, a generated tool call dispatched without validation.

**Failure scenario.** An assistant renders its answer as HTML so links work. A prompt-injected model returns `<img src=x onerror=...>`, and the application has a stored XSS with the model as the delivery vehicle. Or: a text-to-SQL feature executes the generated query on a connection with write access, and a crafted request turns a report into a `DELETE`.

**The fix.** **Model output is user input.** Everything in this catalog applies to it:
- Render through the same escaping path as any other untrusted string.
- Never `eval` generated code; if code execution is the product, sandbox it with no network, no filesystem, and a time limit.
- Generated queries run read-only, against a restricted role, with a statement timeout — and structural elements come from a whitelist, not from the model.
- Validate generated tool arguments against a schema, and authorize the call by the *caller's* permissions, never by what the model asked for.

**Watch for.** Streaming output rendered incrementally, which skips a post-hoc sanitizer; structured output trusted because it parsed as JSON, which says nothing about its values; and downstream services trusting the AI service because it is internal.
