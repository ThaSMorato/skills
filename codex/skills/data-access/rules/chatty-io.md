> Part of the `data-access` skill.

# Chatty I/O

**The tells.** Many small calls to a remote service, cache or queue where the service offers a batched form: one `GET` per id against an API with a bulk endpoint, one cache `get` per key where a multi-get exists, one message published per item where a batch publish exists. Also sequential calls that do not depend on each other, which could run concurrently.

**Failure scenario.** A dashboard fetches 40 user profiles from an internal service, one request each, sequentially, at 30 ms apiece. The page spends 1.2 s waiting on the network. Under load, the 40× request rate trips the downstream service's rate limit, and the dashboard fails outright.

**The fix.**
- **Use the batch form** the service provides (a bulk endpoint, `mget`, a batch publish).
- **Run independent calls concurrently**, with a bound on concurrency so the fan-out cannot become a self-inflicted flood.
- **Cache what is read repeatedly within one request**, so the same remote read happens once.

**Watch for.** Retries multiplying chattiness under failure. A client library that hides a per-item call behind a method that looks like it takes a list. Calls inside a transaction (see `wide-transaction.md`).
