> Part of the `ui-audit` skill (see `SKILL.md`). The stress-tester persona, run with real worst-case data.

# The screen under worst-case data

Designs are drawn with tidy sample data. Real data has the longest name in the company, a thousand rows and a field that is empty. This pass renders the screen with the worst values that can actually arrive, and records what breaks.

## 1. Inventory every rendered value
A table of every value the screen shows: text fields, counts in headers, relative times, badges, data-driven labels, tooltips, avatars, list lengths.

| Field | Source | Type | Limit (`file:line`) | Optional? |
|---|---|---|---|---|

The **limit** comes from the schema, the database column, the API contract or the validation, cited. A field with no limit anywhere is a finding on its own (**unbounded**). Where the frontend and the backend disagree on a limit, note it.

## 2. Build the worst-case data
Every value is **realistic** or is the real limit; never `aaaa`. One dataset touches every applicable row below, spread across the first visible items. Add the shapes: **empty**, **one** (singular forms), and **huge** (1,000+ items where the list is not paginated).

| Kind | Worst cases |
|---|---|
| Names | a long compound name, a one-letter name, diacritics (`Đặng Thị Ngọc Hân`), CJK, an RTL name, an emoji, extra spaces, no name |
| Emails, URLs, IDs | a long email, a very short one, plus-addressing, a long URL, a UUID, a long filename |
| Labels | a long job title or status, a long single word (`Benachrichtigungseinstellungen`), text 30-40% longer in another language, many tags, an empty or whitespace title, markup characters, a newline in a single-line field, a 2,000-character paste |
| Numbers | 0, 1, 1,000,000, a long currency amount, a negative, a percentage over 100, null or NaN, another locale's format |
| Collections | 0, 1, exactly the page size, page size + 1, 1,000+, one oversized item, duplicate names |
| Time | now, days, months and years ago, a future date, 1970-01-01, a timezone day boundary, a very long duration |
| Images | a broken link, none, very wide, very tall, a transparent or dark logo on a dark background |
| States | loading, an API error, partial data, every enum value at once, no permission, the current user inside the list |

## 3. Feed it through the data layer the project already has
Change the data at its boundary, never the markup or the styles: the project's seeds, fixtures, mocks, stories or API stubs. When the project has none that reaches this screen, ask the owner before adding a dev-only switch (a query parameter such as `?data=worst`), and remove it at the end unless the owner wants it kept as a regression check.

## 4. Look in every environment
At the real container width, at 320px, at the widest layout, at 200% zoom, in dark mode when the product has one, and right-to-left when the product supports it. Capture each, and say which findings were seen and which were inferred from the code.

## 5. Read the failure, name the fix

| What you see | Cause | Fix |
|---|---|---|
| a squished avatar or icon | it shrinks in a flex row | `flex-shrink: 0` |
| text pushes past its container | flex or grid child with no minimum | `min-width: 0` / `minmax(0, 1fr)` |
| an email or URL runs off the edge | no break opportunity | `overflow-wrap: anywhere` |
| a trailing action pushed off screen | the middle grows without limit | `min-width: 0` on the middle, `flex-shrink: 0` on the action |
| a badge wraps onto two lines | it shrinks | `white-space: nowrap` and no shrink |
| an avatar adrift beside wrapped text | centered alignment | `align-items: flex-start` |
| the last row cut mid-letter | fixed height | a scroll area or a fade |
| wrong initials | split on spaces | segment by grapheme, first and last word, a fallback |
| an orphan dash for a missing field | placeholder always rendered | omit it, or reserve the height |
| "1 members" | no plural rules | the locale's plural rules |
| numbers jitter as they update | proportional figures | tabular figures |
| `NaN` or `undefined` on screen | no formatting or null guard | locale number formatting and a guard |
| a translated button overflows | fixed width | a minimum width instead |
| accents clipped | tight line height | looser line height |
| a broken image | no fallback | an error fallback and `object-fit: cover` |
| an ellipsis with no way to read the rest | truncation with no disclosure | a title or tooltip and a detail view |
| 1,000 rows stutter | everything rendered | virtualize or paginate |
| raw markup or `&amp;` shown | escaped twice or not at all | escape once, at render |

## Truncate, wrap or clamp
Per field, deliberately: **wrap** identifying text (names, titles); **end-truncate** secondary metadata, with a way to read the whole value; **middle-truncate** values that differ at the end (filenames, paths, hashes); **clamp** previews in cards. **Never truncate** numbers, amounts, dates, or anything the user compares.

## Report
Each break as a finding in the audit: severity **broken** (data lost or unreadable, maps to P0 or P1), **ugly** (readable but wrong, P2), **fragile** (holds now, breaks at the limit, P2 or P3), with the field, the value, what happens and the fix with `file:line`. List the decisions that are the owner's (truncate or wrap a name), and what held up.
