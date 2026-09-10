> Part of the `architecture` skill. Architecture.

# Plugin architecture

The shape that makes the Open-Closed Principle real at system scale: the stable side defines an extension point, the volatile side plugs into it, and the stable side **never learns the plugin's name**.

The asymmetry is the whole idea. The plugin depends on the host; the host does not depend on the plugin. That is what lets a plugin be added, replaced, or deleted without the host being edited, retested or redeployed.

## What it takes
- **An interface owned by the host** — shaped by what the host needs, never by what one plugin happens to provide.
- **A registration mechanism** — configuration, a manifest, service discovery, dependency injection at startup. Anything except the host importing the plugin.
- **A boundary the host may not reach across** — no "just this once" special case for one plugin, which is exactly how the pattern dies.

## Where it belongs
The volatile things in a system are already plugin-shaped, whether or not you treat them that way: the database, the UI, the notification channel, the payment provider, the report format. Each is a candidate for a plug point, and each one you make explicit is a deferred decision you can revisit cheaply.

## The tell that it is fake
- The host has a `switch` on plugin type, or imports a concrete plugin to special-case it.
- The interface has methods only one plugin implements, named after that plugin's internals.
- Adding a plugin requires editing the host's build or its type declarations.

## The caveat
Plug points cost indirection, and speculative ones are the classic over-engineering failure. Create them where variation is **known or strongly expected**, not everywhere something *could* vary. A plug point with one implementation forever is a Zone of Uselessness in miniature.
