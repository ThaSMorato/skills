> Part of the `architecture` skill. Architecture.

# Screaming architecture

**The structure should announce what the system does, not what it was built with.** A directory listing that reads `controllers/ models/ views/ services/` tells you the framework. One that reads `billing/ enrolment/ scheduling/` tells you the system. The first is a blueprint of a delivery mechanism; the second is a blueprint of a business.

The analogy: the plans for a library scream *library* — reading rooms, stacks, a checkout desk. They do not scream *brick*.

## What it implies in practice
- **Top-level structure follows the domain.** Framework and delivery concerns live *inside* a domain slice, or at the edge, not as the organising principle.
- **The framework is a detail you can defer.** If the top level is domain-shaped, the choice of web framework is a decision about one outer directory — see `detail-framework.md`.
- **You should be able to tell what the system does before you can tell how it is delivered.** If it takes reading three files to learn the domain and none to learn the framework, the structure is upside down.

## The test
Show someone the top-level directory listing with no other context. If they can name the business the software serves, it screams. If they can only name the stack, it does not.

## The caveat
Layer-named directories are a real convention in some ecosystems, and fighting the framework's expected layout can cost more than it returns — a Rails app that hides `app/models` is fighting its whole toolchain. The principle still applies **one level in**: inside the framework's required skeleton, organise by domain, and keep the policy free of framework types even when the folder names are the framework's.
