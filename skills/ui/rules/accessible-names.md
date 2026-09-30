> Part of the `ui` skill (see `../SKILL.md`). WCAG 1.1.1, 1.3.1, 4.1.2.

# No accessible name

**The tell.** An icon-only button with no text or `aria-label`; an input whose only label is its placeholder, or a visual label not associated with it (`for` / `id` missing); an image that carries meaning with no `alt`, or a decorative one with a filename as `alt`; a link reading "click here"; a status message that changes silently.

**Failure scenario.** A screen reader announces the toolbar as "button, button, button". The user deletes the record they meant to edit. Or they fill a form whose fields are all announced as "edit text", and cannot tell the email from the phone.

**The fix.** Every control has a name that says what it does: visible text, a `<label>` bound to the input, or `aria-label` when there is no room for text. Meaningful images get an `alt` that says what the image conveys; decorative ones get `alt=""`. Link text makes sense out of context. A message that appears in response to an action (saved, error) goes in a live region (`role="status"` or `role="alert"`) so it is announced.
