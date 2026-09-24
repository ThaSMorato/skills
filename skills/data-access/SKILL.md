---
name: data-access
description: 'A self-contained catalog of data-access and I/O weaknesses you can see in code — N+1 queries, queries inside loops, missing indexes, unbounded results, over-wide transactions, chatty remote calls, stale caches, over- and under-fetching — each with its tell, a concrete failure scenario, and the fix. Use when reviewing a diff that reads or writes a database, cache or remote service, or when asking "will this scale" or "why is this slow".'
---

# Data access

Most of the time a request spends goes to I/O, not to computation, and the expensive mistakes in I/O share a property: **they are invisible at the size of a test fixture.** A loop that issues one query per row runs fast over three rows and times out over three thousand. So these weaknesses pass every test, and a review is the one place they can be caught before production does it.

Two things make them hard to see in a diff:
- **The cost lives in the call, not the line.** `order.customer.name` is one line and can be one query per order. You have to know what the call does.
- **The query is often outside the diff.** The loop was added; the repository method it calls was not changed. Follow the call one hop (see `/review`) or you will not see it.

**The idiom is stack-specific.** Eager loading, batching, pagination and transaction boundaries each have a different spelling in every ORM and driver. Read the repo's stack guide for the spelling; this catalog tells you what to look for.

Read a rule file **only when its row matches**. Every finding carries **the rule**, **a concrete failure scenario** (the data size or access pattern at which it breaks, and what the user sees), and **the fix**. "This could be slow" is not a finding. "Listing 2,000 invoices issues 2,001 queries" is.

## Queries multiplied by a loop
| Weakness | Tell | Rule |
|---|---|---|
| N+1 | a collection is loaded, then an association is touched per element | `rules/n-plus-one.md` |
| Query in a loop | a repository, query or client call inside a loop body, over a collection that can grow | `rules/query-in-loop.md` |
| Chatty I/O | many small remote calls (HTTP, cache, queue) where one batched call exists | `rules/chatty-io.md` |

## Queries that do not scale with the data
| Weakness | Tell | Rule |
|---|---|---|
| Unbounded result | a read with no limit or pagination over a table that grows | `rules/unbounded-result.md` |
| Missing index | a new filter, join or sort on a column no index covers | `rules/missing-index.md` |
| Over- and under-fetching | loading whole rows or graphs to use one field; or loading lazily what is always needed | `rules/fetching.md` |

## Consistency and state
| Weakness | Tell | Rule |
|---|---|---|
| Wide transaction | a transaction that spans remote calls, user think-time, or a loop over many rows | `rules/wide-transaction.md` |
| Cache invalidation | a write path that changes data a cache holds, with no invalidation or expiry | `rules/cache-invalidation.md` |
