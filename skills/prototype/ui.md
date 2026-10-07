> Part of the `prototype` skill (see `SKILL.md`).

# UI branch: switchable variants on the real page

Several **structurally different** variants of a screen, switched from the URL and a small floating bar. The owner flips between them in the browser, picks one or takes parts of each, and the rest is thrown away.

## Where the variants live
**On the real page, by default.** A variant is judged against the real header, the real data and the real density; on an empty route every variant looks fine. So the variants render on the existing route, behind a `?variant=` search parameter, keeping its data fetching, params and auth: only the rendered subtree changes. A new section of an existing page still goes inside that page.

**A throwaway route only when nothing can host it** (a whole new top-level surface), following the project's routing convention, with `prototype` in its path. Check first that no existing page could host it.

## 1. Plan the variants
Three by default, five at most; beyond that they stop being different and become noise. Write the plan in one line at the top of the switcher file: *"Three variants of the settings page on `/settings`, switched by `?variant=`."*

## 2. Make them structurally different
Each variant uses the page's real data and the project's component library, and exports a clear name (`VariantA`, or a descriptive one). They differ in **layout, information hierarchy and primary action**, not in color or copy. If two come out alike, redo one with an explicit constraint ("no card grid"). Variants share small pieces (a header) but never the layout.

## 3. The switcher
One switcher on the route renders the variant the parameter names:

```tsx
// adapt to the project's framework
const variant = searchParams.get('variant') ?? 'A'
return (
  <>
    {variant === 'A' && <VariantA {...data} />}
    {variant === 'B' && <VariantB {...data} />}
    {variant === 'C' && <VariantC {...data} />}
    <PrototypeSwitcher variants={['A', 'B', 'C']} current={variant} />
  </>
)
```

And one shared floating bar, at the bottom center: previous arrow, the variant's key and name, next arrow, wrapping around.
- An arrow updates the search parameter through the framework's router, so a variant is shareable and survives a reload.
- The `←` and `→` keys switch too, except while an input, a textarea or an editable element has focus.
- It looks clearly unlike the page (a high-contrast pill), so nobody judges it as part of the design.
- It does not render in production builds (a `NODE_ENV` check or the project's equivalent), so a stray merge cannot ship it.

## 4. Hand over the URL
With the `?variant=` keys. The answer usually arrives as a combination ("B's header with C's list"): that combination is the design.

## When it is decided
The winner is **rebuilt** in the real page, test-first, by the normal flow; the prototype's variants were written without tests or error handling. The losing variants and the switcher leave the working branch with the rest of the prototype, as the skill's step 3 says.
