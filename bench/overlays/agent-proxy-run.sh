#!/bin/bash
# harbor run for hosts whose only egress is a local HTTPS proxy (Claude Code cloud sessions).
#
#   bench/overlays/agent-proxy-run.sh bench/tasks/due-dates -a nop -o bench/jobs --job-name nop-untouched
#
# Builds the task image with host networking, the proxy from HTTPS_PROXY and the session's
# private CAs trusted in the image, then runs
# `harbor run -p <task> --extra-docker-compose agent-proxy.yaml <args>` on that image.
#
# AGENT_PROXY_CA names a PEM file with those CAs. The default takes every certificate issued by
# the organisation in CA_ORG (default "Anthropic") out of /root/.ccr/ca-bundle.crt: the proxy's
# own CA, and the egress gateway CAs that intercept the hosts NO_PROXY sends past the proxy
# (registry.npmjs.org among them). The whole bundle is too large for a build argument.
set -euo pipefail
task=${1:?usage: $0 <task-dir> [harbor run args]}
shift
: "${HTTPS_PROXY:?HTTPS_PROXY is not set; this script is for hosts behind a local HTTPS proxy}"
if [ -n "${AGENT_PROXY_CA:-}" ]; then
  ca=$AGENT_PROXY_CA
else
  bundle=/root/.ccr/ca-bundle.crt
  test -r "$bundle" || { echo "$0: CA bundle not readable: $bundle" >&2; exit 1; }
  ca=$(mktemp)
  trap 'rm -f "$ca"' EXIT
  pem=""
  while IFS= read -r line; do
    pem+="$line"$'\n'
    if [ "$line" = "-----END CERTIFICATE-----" ]; then
      if printf '%s' "$pem" | openssl x509 -noout -subject | grep -q "O = ${CA_ORG:-Anthropic}"; then
        printf '%s' "$pem" >> "$ca"
      fi
      pem=""
    fi
  done < "$bundle"
fi
test -s "$ca" || { echo "$0: no CA certificates found in $ca" >&2; exit 1; }
image="starters-$(basename "$task"):agent-proxy"
docker build --network host \
  --build-arg HTTPS_PROXY="$HTTPS_PROXY" \
  --build-arg NO_PROXY="${NO_PROXY:-}" \
  --build-arg EXTRA_CA_CERT_B64="$(base64 -w0 "$ca")" \
  -t "$image" "$task/environment"
AGENT_PROXY_IMAGE=$image exec harbor run -p "$task" \
  --extra-docker-compose "$(dirname "$0")/agent-proxy.yaml" "$@"
