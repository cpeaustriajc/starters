#!/bin/bash
# Fails when a task image builds a template at a commit other than the hub's submodule pin.
set -euo pipefail
cd "$(dirname "$0")/.."
status=0
for dockerfile in bench/tasks/*/environment/Dockerfile; do
  template=$(sed -n 's|.*github.com/cpeaustriajc/\([^ ]*\)\.git.*|\1|p' "$dockerfile" | head -1)
  want=$(git ls-tree HEAD "$template" | awk '{print $3}')
  have=$(sed -n 's/^ARG TEMPLATE_COMMIT=//p' "$dockerfile")
  if [ "$want" != "$have" ]; then
    echo "$dockerfile: TEMPLATE_COMMIT $have, submodule $template is $want"
    status=1
  fi
done
exit $status
