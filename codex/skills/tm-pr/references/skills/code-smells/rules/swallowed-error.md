> Part of the `code-smells` skill (see `../SKILL.md`).

# Swallowed Error

**Tell:** a failure happens and nothing downstream can tell. The shapes, from worst to least:

| Shape | What it looks like |
|---|---|
| **Empty catch** | `catch (e) {}`, `rescue => e; end`, `except: pass` |
| **Log and continue** | the error is logged and execution goes on as if the operation succeeded |
| **Silent default** | the catch returns `null`, `[]`, `0` or `false`, so the caller reads "nothing there" instead of "it broke" |
| **Retries that give up quietly** | a retry loop that exhausts its attempts and returns, instead of raising or reporting |
| **Over-broad catch** | catching the base exception type around a block, which also hides the bugs nobody expected |
| **Promise without a handler** | an async call whose rejection nobody awaits or handles |

**Why it hurts:** the failure is still there; it has only moved to a later, farther place with less context. A payment that "succeeded" with an empty result, a sync that "found nothing" because the API was down: the system goes on computing on a lie. The cost is paid by whoever debugs it, without the stack trace.

**The question to ask of every catch:** *what would this hide?* If the answer includes a failure the caller would act differently on, the catch is wrong.

**Fix:** let it propagate, or catch only the specific failure you can actually handle, and handle it (a fallback the caller is told about, a retry with a final raise, a translated error with the original attached). If swallowing is truly right (best-effort telemetry, a cleanup on an already failing path), say so in a comment that states why the failure does not matter.

## Where the boundary is
"Rethrow and let the layer above handle it" assumes there is a layer above. In an HTTP request there is: the global error handler turns the exception into a response, the request fails, the server stays up. In a worker, a queue consumer, a cron job or an event handler, an exception that climbs to the loop can bring the process down (in Node, an unhandled rejection ends it) and stop everything after it. Fail fast still holds, for the **unit of work**, not the process:

| Execution | The boundary | What it does with the failure |
|---|---|---|
| HTTP request | the global handler | maps it to a status and an error body, logs it with context |
| queue message, event handler | the message handler | retries a system error with backoff, sends one that always comes back to a dead-letter queue, records the id, the attempt and the correlation id |
| cron, scheduled job | the body of one run | marks the run failed, alerts, lets the next run go |

The boundary **handles** the failure and leaves a trace. A catch inside the unit that logs and goes on is still this smell; the one at the boundary that marks the failure is not. When the failure is the process's own (configuration missing at boot, a connection that never comes back, corrupted internal state), crashing is right and the supervisor restarts it.

**Severity:** an empty catch or a silent default on a path that moves money, data or permissions is a defect, not a heuristic; report it `high` or above.
