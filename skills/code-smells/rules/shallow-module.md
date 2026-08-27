> Part of the `code-smells` skill (see `../SKILL.md`).

# Shallow Module

**Tell:** a module's interface is nearly as complex as the functionality it delivers — lots to learn to use it, little real work hidden.

The root Ousterhout red flag: a module's value is *functionality minus interface*. When the interface is large and the payoff small, it barely pays for its own complexity. Pass-Through Methods, Overexposure, and interface-contaminating docs are all symptoms of shallowness, as are many thin classes stacked "layer on layer" where none hides a real decision.

**Fix:** Make the module deeper — a narrow interface hiding a substantial implementation. Gather responsibilities that always travel together instead of spreading them across thin layers, and hide the design decision behind the interface.
