# Microsoft's Playwright image: Ubuntu noble, Node 26, and the Chromium build for this Playwright
# release in /ms-playwright with its system libraries already installed. node:26-bookworm needed
# `npx playwright install --with-deps chromium`, which downloads from cdn.playwright.dev and
# deb.debian.org; hosts behind an egress allowlist (Claude Code cloud sessions) reach neither, but
# do reach mcr.microsoft.com. Keep PLAYWRIGHT_VERSION equal to the image tag.
FROM mcr.microsoft.com/playwright:v1.64.1-noble@sha256:2f05f8a734509a7b3f26a912639488ee08f58a7b292d14d62271bcff9038768f
ARG PLAYWRIGHT_VERSION=1.64.1

# Keep TEMPLATE_COMMIT equal to the tanstack-start-todo submodule commit in the hub
# (`git submodule status`). bench/check-pins.sh fails when they differ.
ARG TEMPLATE_COMMIT=18d17934fec6e49df7c28ff720f4d318c8c3e710

# Hosts whose only egress is a local HTTPS proxy pass the CAs that intercept their TLS here (PEM,
# base64), with HTTPS_PROXY as a build arg; bench/overlays/agent-proxy-run.sh does both. Empty
# elsewhere, so this layer does nothing. CAs are public, so they may sit in the image history.
ARG EXTRA_CA_CERT_B64=""
RUN if [ -n "$EXTRA_CA_CERT_B64" ]; then \
      printf '%s' "$EXTRA_CA_CERT_B64" | base64 -d > /usr/local/share/ca-certificates/extra-ca.crt \
      && update-ca-certificates \
      && npm config set -g cafile /etc/ssl/certs/ca-certificates.crt; \
    fi

ENV TZ=UTC CI=1

# The template is built for Node 26; fail the build if the base image moved off it.
RUN node -v | grep -q '^v26\.'

RUN git clone https://github.com/cpeaustriajc/tanstack-start-todo.git /app \
 && git -C /app checkout --detach "$TEMPLATE_COMMIT" \
 && git -C /app config user.name "bench" \
 && git -C /app config user.email "bench@localhost"

WORKDIR /app
RUN npm ci

# Grader browser driver. The browsers themselves come with the base image (PLAYWRIGHT_BROWSERS_PATH
# is /ms-playwright). The hidden tests are uploaded to /tests only after the agent stops.
WORKDIR /opt/grader
RUN npm init -y >/dev/null \
 && npm install "playwright@$PLAYWRIGHT_VERSION"

WORKDIR /app
