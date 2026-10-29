<!--
TEMPLATE: parallel-sessions (how a second copy of this project runs at the same time)
Filled by the guideline-generator, beside docs/guidelines.md, which routes to it. Read by /tm-implement
when it runs in a linked worktree, and by /tm-flow before it prints worktree commands.
A row the repo does not show says `to be established`; /tm-guidelines asks the owner for it.
A project with nothing to isolate (no server, no database, no port) says so in section 1, and the
other sections say `none`.
Env files are described by variable NAMES only: never a value.
-->

# Parallel sessions: <project>

> Two sessions of this project at once, each in its own worktree, collide on the first thing they
> share: a port, a database, an env file, a log path. This page says how each session gets its own.

## 1. What two sessions would share (required)
> One line: what in this project collides between two copies running at once, or `nothing to
> isolate`, and why.

## 2. Ports (required)
> The range each session takes, and how a session finds its own: a number per worktree (an offset
> from the base port), written where the app reads it.

| Service | Base port | Per session | Read from |
|---|---|---|---|
| <web> | <3000> | <base + N, one N per worktree> | <the variable name, e.g. `PORT`> |

## 3. Database (required)
> One database (or schema) per session, named with a prefix, and how it is created and dropped.

| Store | Name per session | Create | Drop |
|---|---|---|---|
| <postgres> | <`app_dev_<worktree>`> | <command> | <command> |

## 4. Env file (required)
> Each worktree has its own env file, made from the example the repo versions. Variable names only.

- **Example:** <the versioned example file, or `none`>
- **Per worktree:** <the copy step, and the variables that change per session, e.g. `PORT`, `DATABASE_URL`>

## 5. Automations (required)
> The scripts, containers and tasks that must take the port or the name as a parameter instead of a
> fixed value: a compose project name, a seed script, a test server, a log path.

| Automation | Takes | Fixed today |
|---|---|---|
| <`docker compose`> | <project name from the worktree> | <`container_name: app-db`> |

## 6. .scratch in a worktree (required)
> How the flow's working files reach a new worktree: `tracked` (the branch carries them), `link` (a
> symbolic link to the main worktree's `.scratch`, which works only when the ignore rule also matches
> a file, since `.scratch/` does not match a link), or `copy` (the feature folder copied in, and the
> ticket's `plans/<NN>-<slug>/` copied back to the main worktree when it ends).
