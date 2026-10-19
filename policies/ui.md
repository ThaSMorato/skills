# UI contracts and verification
Design-system tokens have primitive -> semantic -> component layers; component tokens reference semantic roles and theme modes, not raw palette values. UI spec rows declare role (display-only, local interaction, server-connected), intent and ticket AC, route, auth, render strategy, loading/empty/denied/failure states and error catalog.

When Figma exists, inventory every collection and mode explicitly; an active-mode response is not all themes. Read all available modes before changing tokens. Report unavailable modes; never overwrite a light token with a dark value. Audit Figma/code differences and light/dark symmetry for states, tokens, contrast and focus. Library components are installed using the project's package manager first, then synchronized with the design system, preserving the library's accessibility behavior.

Tailwind v4 source discovery may scan Markdown. Check the installed source configuration and built CSS; exclude documentation paths or use explicit sources where docs code examples produce accidental classes. Do not assert every Markdown file is scanned in every project.
