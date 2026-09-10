> Part of the `architecture` skill. Details.

# Frameworks are details

A framework author solves *their* problem, not yours, and asks for a deep commitment in return: inherit from these base classes, annotate your types, adopt this lifecycle, structure your code this way. The commitment is asymmetric — you marry the framework, and the framework does not marry you. It will change in ways that suit its roadmap, and it will not migrate your code.

## The bargain to strike
**Use the framework; do not let it into the policy.** Treat it as an outer-circle tool reached through your own abstractions:

- Framework types stay in the outer circles — controllers, gateways, configuration, the composition root.
- The policy holds no framework imports, no base classes, no annotations, no lifecycle hooks.
- Where the framework offers something the policy needs (a scheduler, a queue, a mailer), the policy declares its own interface and an outer adapter implements it with the framework.

## The tell
- Domain or use-case types importing from the framework's namespace.
- Business rules that can only run once the framework has bootstrapped.
- A framework upgrade producing a diff in the domain layer.
- Tests of policy that need the framework's test harness.

## The honest exception
Some frameworks are effectively the language — the standard library, the runtime, the language's own async primitives. Depending on those is depending on something stable and non-volatile, which is exactly what the Stable Dependencies Principle permits. The question is not "is it a library" but **"how likely is this to change under me, and how much would it cost when it does?"**

## The caveat
Full isolation is expensive, and fighting a highly opinionated framework can cost more than the risk it removes. Where you accept the coupling, accept it **deliberately, in one named place**, and record it — an ADR that says "we bind the persistence layer to this ORM, and here is what that costs us" is a decision. The same coupling arrived at by accident, spread everywhere, is the failure.
