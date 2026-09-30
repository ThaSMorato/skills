> Part of the `ui` skill (see `../SKILL.md`).

# Missing loading, empty or error state

**The tell.** A component that fetches or submits renders only the success case: nothing (or the previous content) while it loads, a blank area when the list is empty, nothing, a console error or an eternal spinner when the request fails; a submit button that can be pressed again while the first request is in flight.

**Failure scenario.** On a slow connection the order history shows an empty table for four seconds; the user concludes they have no orders. The API fails, the spinner never stops, and there is no way to retry. The user presses "Pay" twice because nothing changed after the first press.

**The fix.** Design all four: **loading** (a skeleton or indicator, announced; the previous content marked as stale), **empty** (says there is nothing, and what to do), **error** (says what failed and offers a retry, in a live region), **success**. Disable or de-duplicate a submit while it is pending. Test the three non-happy states (`testing` → frontend patterns: *Test all three states*).
