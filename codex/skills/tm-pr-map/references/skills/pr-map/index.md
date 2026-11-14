---
name: pr-map
description: 'Map any pull request before reviewing it, a colleague''s included, without touching it: what it changes and why, how much attention it needs (door, blast radius, risk paths), every changed file once grouped by role, the links between the changed files, an order to read them, and what CI proved. Use before reviewing a pull request, above all one this flow did not produce.'
disable-model-invocation: true
user-invocable: false
---

A reviewer loses the most time before reading a single line: which files changed, how they connect, where to start, and how careful to be. This stage draws that map for any pull request, from what git and the host already hold, and never changes the pull request, the branch or the working tree.

## Sources
Resolve the target first:
- **A pull request** (a number or its URL): `gh pr view <number> --json number,title,body,author,url,baseRefName,headRefName,isDraft,state`. Fetch both sides as refs only: `git fetch origin <baseRefName>` and `git fetch origin pull/<number>/head` (GitHub; another host has its own ref for a merge request), then base `origin/<baseRefName>` and head `FETCH_HEAD` (or name it: `git fetch origin pull/<number>/head:refs/pr-map/<number>`, and remove it at the end with `git update-ref -d refs/pr-map/<number>`). A fetch writes refs inside `.git` only: the branch, the index and the working tree stay as they are. A merged pull request whose base branch is gone uses the merge commit's first parent as the base (`gh pr view <number> --json mergeCommit`), and the map says so.
- **Two refs** (`<base>..<head>`): local branches or commits; nothing is fetched.

Then run `node "references/scripts/change-map.mjs" --base <base> --head <head>`. It prints every changed file exactly once (status, lines added and removed, kind, whether it is only skimmed and why), the links between the changed files (an import line in one that names the other), and an order: each file after the files it depends on, the schema first, then tests, docs and the skimmed files last. Do not build the list of files yourself: the script's list is complete by construction, and a test fails when it is not.

Read, do not recall:
- the files at the head with `git show <head>:<path>`, never by checking the branch out;
- the why: the pull request's description and the issue it closes (`gh issue view`);
- when the repo has them: the glossary (`CONTEXT.md`), the components map (`docs/architecture/components.md`) and the guidelines' `Risk paths`.

**Evidence comes from CI**: `gh pr checks <number>`, each check with its state and link. Never check the branch out to run tests. Only when the head already is the current branch (the owner is on it) may the repo's gates run here, and the map says they did.

## The map
1. **What it changes and why**, in two sentences of domain words. The why comes from the description or the issue; when neither says, write `why: not stated`: it is the first question for the author.
2. **Review attention.** The door and the blast radius, read from the diff by the rules of the Merge danger in `references/skills/pr/index.md`, then the attention by the same rule: `close`, `normal` or `light`, with the reason. A file under a `Risk paths` entry raises it one level.
3. **The tree.** Every changed file exactly once, grouped by role. The script's kinds are the start; split `source` by role, reading the code and the components map: **contract** (the types, interfaces and schemas the others read), **domain** (the rules), **adapters and callers** (persistence, remote clients, wiring), **entry and UI** (handlers, routes, screens). Each file with its lines added and removed and one line on what changed in it; the skimmed ones marked with why.
4. **The links.** A Mermaid `flowchart` with the script's edges only, one node per file, grouped by role. No edge the script did not print. When it printed none, say so and why it may have missed them (another language, loading by name at runtime), instead of drawing guesses.
5. **The reading order.** A numbered list: the script's order, refined by role (contract → domain → adapters and callers → entry or UI → tests). Each step says what to look for in that file and which question it answers. Files in a cycle are read together.
6. **What is proven and what is not.** The CI checks and their state; what nothing proves (a changed behavior no test in the diff reaches, a check that did not run); and where a closer look pays: the one-way part, the risk paths, the file with the most links.
7. **Next step.** When the attention is `close` or the map found a risk, recommend a full review: `$thasmorato-skills:tm-review <base>` once the owner checks the branch out, or the repo's own review process. Otherwise, the map is enough to start reading.

**Done when** every file of the script's list appears once in the tree and once in the reading order, and every edge of the flowchart is one the script printed.

## Output
Read the `visuals` skill (`references/skills/visuals/index.md`) and render the map as its `html-report.md` says (one self-contained page in the temp directory, opened for the owner, the path printed): the tree collapsible by role, each file opening its hunks (`git diff <base>...<head> -- <path>`), the flowchart beside the reading order.

Keep the record in `.scratch/pr-maps/<number or head>.md` when the repo ignores `.scratch/` (`git check-ignore -q .scratch`); when it does not, beside the page in the temp directory, and say so: a colleague's repository gets nothing written into it.

```markdown
---
kind: pr-map
plugin_version: 0.7.0
model: <the model id your harness reports for this session; `unknown` when it does not say>
harness: <claude-code | codex>
instructions: [<every value the project instructions already in your context ask this field to list, exactly as written; [] when none does; never open a file to find one>]
target: <the pull request URL, or base..head>
base: <ref>
head: <ref or sha>
files: <n>
skimmed: <n>
edges: <n>
door: <one-way | two-way>
blast_radius: <one word>
review_attention: <close | normal | light>
ci: <passing | failing | pending | none>
---
```

Then the map's seven parts in markdown, so the record stands without the page.

**Never post, comment, approve or check out.** The pull request belongs to its author and its reviewers; this stage only reads. Posting the map as a comment is the owner's call, done by the owner.
