<!--
TEMPLATE: guidelines (Engineering / Development Guidelines)
Filled by the guideline-generator, once per project, self-contained (principles + stack applied to
this language). Evaluate each (optional) section and include ONLY if the language/stack supports it;
PRUNE + RENUMBER so sections stay sequential with no gaps. Target 1000–1500 lines, concise and
practical (show code, good-vs-bad examples), no emojis, no TODO/TBD placeholders.
-->

# Engineering Guidelines — <language / stack>

## 1. Project Stack (required)
> What is used, at a glance — language + version, web framework, ORM, database, testing, formatting, linting, logging, build. Mark each as specified or auto-populated (language default). Link the libraries' docs.

## 2. Core Principles (required)
> The non-negotiables for this project/language (e.g. simplicity, self-explanatory code, run static analysis before commit).

## 3. Setup & Initialization (required)
> How to bring the environment up/down, run scripts, migrations, containers (Dockerfile/Compose).

## 4. Project Structure (optional)
> Directory layout and where things live. May link architectural docs.

## 5. Code Conventions (required)
> Naming, typing, functions/signatures, error handling — with short examples.

## 6. Testing (required)
> Unit, mocks, test doubles (stub/mock/fake/spy), integration; how to run tests. Include code examples.

## 7. Profiling & Diagnostics (optional)
> Benchmarks, optimization, how to check runtime behavior.

## 8. Security (optional)
> Critical points, input validation.

## 9. Code Patterns — Good vs Bad (required)
> What to do and what to avoid, shown as good-vs-bad snippets (this gives AI the most clarity).

## 10. Dependency Management (optional)
> Packages, managers, versioning.

## 11. Comments & Documentation (optional)
> How to comment/document and where to link the rest of the docs.

## 12. Database (optional)
> Modeling, queries, migrations. Include examples.

## 13. Logs & Observability (optional)
> Log structure, metrics, tracing. Include examples.

## 14. Golden Rules → Pre-commit checklist (required)
> The rules that tie it together, as a pre-commit checklist the AI (or a hook) runs: compiles, tests pass (incl. race detection where relevant), errors handled, docs current, containers work.
- [ ]

## 15. References (required)
> External and internal links that support the process.
