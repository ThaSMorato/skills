#!/usr/bin/env bash
# Human-in-the-loop reproduction for a bug that needs a step only a person can take.
# Copy this file next to the diagnosis, fill in the three parts marked FILL IN, and hand it to the
# person who can take the step. Each round records what they saw, so the diagnosis reads the tally
# instead of a recollection. Secrets stay out: never ask the person to paste a token or password.
set -euo pipefail

ROUNDS="${ROUNDS:-5}"
LOG="${LOG:-./hitl-loop.log}"

# FILL IN: what the person does, in steps a stranger could follow.
STEP='1. Open <url>
2. Do <action>
3. Look at <where the symptom shows>'

# FILL IN: the yes/no question that says whether the bug showed this round.
CHECK='Did <the exact symptom the owner reported> happen?'

# FILL IN (optional): a command run after each round to capture evidence automatically
# (a log tail, a DB query, a curl). Leave empty to skip. Redact what it prints.
CAPTURE=''

red=0
green=0
: >"$LOG"

for round in $(seq 1 "$ROUNDS"); do
  printf '\n== Round %s of %s ==\n%s\n\n' "$round" "$ROUNDS" "$STEP"
  read -r -p 'Press Enter once the step is done... ' _

  answer=''
  until [[ "$answer" =~ ^[yn]$ ]]; do
    read -r -p "$CHECK [y/n] " answer
  done
  read -r -p 'Anything else you noticed (Enter to skip): ' note

  evidence=''
  if [[ -n "$CAPTURE" ]]; then
    evidence="$(bash -c "$CAPTURE" 2>&1 || true)"
  fi

  if [[ "$answer" == y ]]; then red=$((red + 1)); verdict=red; else green=$((green + 1)); verdict=green; fi
  {
    printf 'round=%s verdict=%s note=%q\n' "$round" "$verdict" "$note"
    if [[ -n "$evidence" ]]; then printf '%s\n' "$evidence"; fi
  } >>"$LOG"
done

printf '\nReproduced %s of %s rounds (red=%s green=%s). Log: %s\n' "$red" "$ROUNDS" "$red" "$green" "$LOG"
