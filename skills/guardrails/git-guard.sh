#!/usr/bin/env bash
# Claude Code PreToolUse hook (matcher: Bash) that stops destructive git commands before they run.
# Installed by the `guardrails` skill. Reads the hook's JSON on stdin; exit 2 blocks the call and its
# stderr is shown to the agent, exit 0 lets it run.
#
# Each rule is a name and an extended regex matched against what follows `git` (and an optional
# `-C <dir>`). Edit RULES to taste. GIT_GUARD_ALLOW="push,clean" lets named rules through, for a
# session or a project that wants them.
set -uo pipefail

RULES=(
  'push|push([[:space:]]|$)'
  'reset-hard|reset([[:space:]]+[^;&|]*)?[[:space:]]--hard'
  'clean|clean[[:space:]]+([^;&|]*[[:space:]])?-[a-zA-Z]*f'
  'branch-force-delete|branch[[:space:]]+([^;&|]*[[:space:]])?(-D|--delete[[:space:]]+--force|--force[[:space:]]+--delete)([[:space:]]|$)'
  'checkout-discard|checkout[[:space:]]+([^;&|]*[[:space:]])?--([[:space:]]|$)'
  'restore-worktree|restore[[:space:]]+[^-[:space:]]'
  'stash-drop|stash[[:space:]]+(drop|clear)([[:space:]]|$)'
)

input="$(cat)"

extract_command() {
  if command -v jq >/dev/null 2>&1; then
    jq -r '.tool_input.command // empty' <<<"$input"
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' <<<"$input"
  elif command -v node >/dev/null 2>&1; then
    node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).tool_input?.command ?? ""))' <<<"$input"
  else
    sed -nE 's/.*"command"[[:space:]]*:[[:space:]]*"(([^"\\]|\\.)*)".*/\1/p' <<<"$input" | sed -E 's/\\"/"/g; s/\\\\/\\/g'
  fi
}

# Quoted text is data, not a command: `echo "git push"` runs echo.
strip_quoted() {
  sed -E "s/\"([^\"\\\\]|\\\\.)*\"//g; s/'[^']*'//g"
}

command_line="$(extract_command | strip_quoted)"
allowed=",${GIT_GUARD_ALLOW:-},"
git_call='(^|[;&|(]|&&|\|\|)[[:space:]]*git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+'

for rule in "${RULES[@]}"; do
  name="${rule%%|*}"
  pattern="${rule#*|}"
  [[ "$allowed" == *",$name,"* ]] && continue
  if [[ "$command_line" =~ ${git_call}${pattern} ]]; then
    printf 'This command was blocked by the guardrails hook (rule: %s). It can discard work or publish it, so it is the owner'"'"'s call: tell the owner what you were trying to do and let them run it, or ask them to allow the rule with GIT_GUARD_ALLOW=%s.\n' "$name" "$name" >&2
    exit 2
  fi
done

exit 0
