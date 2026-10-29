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

**Severity:** an empty catch or a silent default on a path that moves money, data or permissions is a defect, not a heuristic; report it `high` or above.
