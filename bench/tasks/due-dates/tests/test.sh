#!/bin/bash
# Grades only the result in /app: the template's own gates, then a hidden browser check.
set -uo pipefail

LOGS=/logs/verifier
mkdir -p "$LOGS"
cd /app

# Staging is not part of the result. migrations:check counts untracked migration files as
# missing, so stage the whole working tree before the gates run.
git add -A

verify=0
echo "== npm run verify"
if npm run verify 2>&1 | tee "$LOGS/verify.log"; then verify=1; fi
echo "verify=$verify"

e2e=0
echo "== e2e: due date shown on the page"
cp /tests/e2e.mjs /opt/grader/e2e.mjs
if node /opt/grader/e2e.mjs 2>&1 | tee "$LOGS/e2e.log"; then e2e=1; fi
echo "e2e=$e2e"

reward=$((verify * e2e))
printf '{"reward": %d, "verify": %d, "e2e": %d}\n' "$reward" "$verify" "$e2e" | tee "$LOGS/reward.json"
