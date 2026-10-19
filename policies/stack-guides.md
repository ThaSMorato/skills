# Stack and repository steering
Read existing initialization decisions, lockfile and ADRs first; consult documentation for installed versions. Record host-only and container-only commands separately, including cwd, service, env and equivalent invocation; never assume dependencies inside a container exist on the host.

Generate path-scoped `.claude/rules/*.md` using `paths` frontmatter plus CLAUDE.md per subproject, with a small root routing table; include globs for files that do not exist yet so planning sees their conventions. For Codex use AGENTS.md per subproject; do not assume Claude rules are automatically loaded there. Avoid contradictory copies; link authoritative guides.

For Nest, runtime non-TS assets must be copied by `compilerOptions.assets` and checked from dist; read process.env only in configuration `registerAs` factories. Migration conventions: immutable once applied, one table per migration when the project follows this convention, area prefix, separate CLI connection/config, compatibility for expand/migrate/contract. Honor established project choices before proposing defaults.

The stack guide selects and configures the stack's mutation tool and incremental command, separately from general testing doctrine. Detect stale testing guides against init files, rules and runner config (git revisions and mtimes are signals); compare changed decisions and incrementally refresh affected sections, preserving custom local guidance. Never regenerate wholesale just because a timestamp differs.
