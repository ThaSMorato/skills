> Part of the `architecture` skill. The one method every stage uses to measure the dependency graph — `/analyze`, `/reconcile` and the `review-architecture` lens — so two measurements of the same code can be compared.

# Measuring the import graph

Every structural claim this suite makes (cycles, `Ca`/`Ce`, instability, a forbidden edge, a latent component) is arithmetic over one graph: **which component's code imports which other component's code.** If each stage extracts that graph its own way, their numbers disagree for reasons that have nothing to do with the code, and a reconciliation compares two methods instead of two states. So there is one method, and it is this one.

## 1. Files → components
Map every source file to a component using the `Lives in` paths in `docs/components.md`. A file no component claims goes in an `unassigned` bucket, and the bucket's size is reported. A large one means the component map no longer describes the code, and that is a finding in itself. With no component map yet (the first `/analyze`), use the top-level source directories, or the ecosystem's own packages, as provisional components, and say so.

## 2. Edges: the ecosystem's tool first, then the recipe
**Use the native tool when it is installed.** It resolves imports the way the compiler or runtime does, including aliases, re-exports and path mappings:

| Ecosystem | Tool |
|---|---|
| Go | `go list -deps -json ./...` |
| JavaScript / TypeScript | `madge --json` or `dependency-cruiser --output-type json` (respects `tsconfig` paths) |
| Python | `pydeps --show-deps --no-output`, or `import-linter` contracts if configured |
| Java / Kotlin | `jdeps -verbose:package` on the compiled classes |
| .NET | the solution's project references, plus `using` lines for namespaces within a project |
| Rust | `cargo metadata` for crates; `use crate::` lines within a crate |

**Otherwise, the recipe.** Grep the import statements and resolve each target to a file, then to its component:

| Language | Import lines | Resolve |
|---|---|---|
| JS / TS | `import … from '…'`, `require('…')`, `import('…')` | relative paths from the importing file; aliases from `tsconfig`/bundler config; bare specifiers are external |
| Python | `import x.y`, `from x.y import z` | module path under the source roots |
| Go | the `import (…)` block | module path from `go.mod` |
| Java / Kotlin / C# | `import`, `using` | package / namespace → directory |
| PHP | `use Vendor\Pkg\Class` | PSR-4 map in `composer.json` |
| Rust | `use crate::…`, `mod` | module tree |
| **Ruby / Rails** | **none** (autoloading) | **constant references**: grep `CapitalizedName` and `Namespace::Name`, then map each to the file the autoloader would load (Zeitwerk naming) |

**Mark each language's method** in the output: `native`, `recipe`, or `approximate`. Ruby's constant-reference recipe is always `approximate`: it misses references built by metaprogramming and can match a constant that is only mentioned in a string. Report edges from it as edges, but never report a cycle that only it found without saying which references close it, so a reader can check them by hand.

## 3. Count at component level
Collapse file edges to component edges and keep the **count** of file-level references behind each one. An edge carried by one import is a very different fact from one carried by forty, and the difference decides whether a violation is a slip or a dependency.

Drop edges to external packages (they are the dependency audit's subject) and self-edges.

## 4. Derive
From the component graph: cycles (every one, as its full path), and per component `Ca`, `Ce`, `I = Ce / (Ca + Ce)`. Abstractness `A` needs the language's notion of an abstract type (interface, protocol, abstract class, trait); count it where the language has one, and write `n/a` where it does not, rather than guessing. The formulas and their reading are in `rules/metrics.md`.

## Output
The graph is written to `docs/analysis/dependency-graph.md`, filling `${CLAUDE_PLUGIN_ROOT}/templates/dependency-graph.md`, with `measured_commit` set to the commit it was measured at. That commit is what makes a later measurement comparable, and what `/flow` uses to detect drift.
