> Part of the `data-access` skill.

# N+1

**The tells.** A collection is loaded, and inside the loop over it an association or related record is read: `for order in orders: order.customer.name`. With a lazily loading ORM, each access issues its own query, so the total is **1 query for the collection + N for the association**. The same shape hides in serializers, templates and view models that render a list, where the loop is the framework's and the association access is one field in a mapping. It is still one query per element.

**Failure scenario.** A page that lists 50 orders in development issues 51 queries and renders in 80 ms. In production, the same page lists 2,000 orders for a large account and issues 2,001 queries. It takes 12 seconds and times out behind the load balancer. No test fails, because every fixture has three orders.

**The fix.**
- **Load the association with the collection**: the ORM's eager loading, a join, or a second query by the collected ids (`WHERE customer_id IN (...)`). This makes it 2 queries whatever the size.
- **Pick the form by what you do with it.** A separate preload query cannot filter on the association; a join can, but duplicates parent rows for one-to-many. The stack guide names the idiom.
- **Make it fail loudly** where the stack allows it: strict loading, or a test that asserts the query count for N > 1.

**Watch for.** Nested N+1, where the association itself has an association read in the loop (N×M). Eager-loading an association in one path while another path to the same view still loads lazily. A count or existence check per element (`order.items.count`) is an N+1 of aggregate queries.
