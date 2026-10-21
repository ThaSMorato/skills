> Part of the `ui` skill (see `../SKILL.md`). Core Web Vitals: CLS, INP.

# Layout shift and slow interaction

**The tell.**
- **Shift (CLS):** images, video or iframes with no `width` / `height` or aspect ratio; ads, banners or late-loading content inserted **above** what the user is already reading; web fonts that swap with very different metrics; a button that moves when the data arrives.
- **Slow response (INP):** an input, click or keystroke handler doing heavy synchronous work (parsing, sorting a large list, a big re-render) before the screen can update; a whole list re-rendered on every keystroke.

**Failure scenario.** The user goes to tap "Cancel", the promo banner loads above it, and the tap lands on "Confirm". Or every keystroke in the search box freezes the page for 300 ms while ten thousand rows are filtered.

**The fix.** Reserve space: set dimensions or `aspect-ratio` on media, reserve a slot for late content or insert it below the fold, and use font fallbacks with matching metrics. For interactions, update the screen first and defer the heavy work (debounce input, move work off the main thread, virtualize long lists, memoize the re-render). **The diff shows the pattern; measure the effect** with the browser's performance tools before and after.
