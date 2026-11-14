> Part of the `acceptance` skill (see `SKILL.md`). Also run by the `ui-audit` skill's technical pass (`technical.md`, Integrity).

# Visual checks: what the user can actually see

A screenshot is read by a model, and a model reading a picture sees what it expects: a thumbnail that failed to load looks like a grey card, a button half under a banner looks like a button. These four checks ask the page instead. Run them in the browser tool's script evaluation, on each element an item says the user sees (the image, the control, the message), and record what each returned as the verdict's Check.

| Check | Fails when | Measures |
|---|---|---|
| **Media loaded** | an `<img>` with `naturalWidth` of 0 after `complete`, a `<video>` with `readyState` below 2, a CSS background whose image request failed | the file the user should see is not there |
| **In the viewport** | the element's box lies outside `window.innerWidth` × `window.innerHeight` at the width checked, with no scroll that reaches it | the user cannot see it without knowing where to look |
| **Not clipped** | an ancestor with `overflow` other than `visible` cuts the element's box (its box is larger than what the ancestor shows), or its own size is 0 | part of it, or all of it, is hidden |
| **Clickable at its center** | `document.elementFromPoint` at the center of a control returns neither the control nor something inside it | another element covers it: a click lands elsewhere |

```js
// Pass the selector of one element an item names; returns one entry per check.
(selector) => {
  const el = document.querySelector(selector)
  if (!el) return { found: false }
  const box = el.getBoundingClientRect()
  const media = el instanceof HTMLImageElement ? el.complete && el.naturalWidth > 0
    : el instanceof HTMLVideoElement ? el.readyState >= 2 : null
  const inViewport = box.width > 0 && box.height > 0 && box.right > 0 && box.bottom > 0 &&
    box.left < window.innerWidth && box.top < window.innerHeight
  let clippedBy = null
  for (let parent = el.parentElement; parent && !clippedBy; parent = parent.parentElement) {
    if (getComputedStyle(parent).overflow === 'visible') continue
    const shown = parent.getBoundingClientRect()
    if (box.left < shown.left || box.top < shown.top || box.right > shown.right || box.bottom > shown.bottom) clippedBy = parent.tagName.toLowerCase()
  }
  const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
  return { found: true, mediaLoaded: media, inViewport, clippedBy, clickableAtCenter: hit === el || el.contains(hit) }
}
```

Scroll the element into view before the clipping and center checks when the item is about the element itself rather than about where it first appears; when the item says it is visible on arrival ("above the fold", "on load"), check before scrolling.

A check that fails is the verdict: the item fails, whatever the screenshot looks like. A check that cannot run (no script evaluation in the browser tool) leaves the verdict `capture only`, and the record says so.
