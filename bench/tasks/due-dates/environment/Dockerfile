FROM node:26-bookworm

# Keep TEMPLATE_COMMIT equal to the tanstack-start-todo submodule commit in the hub
# (`git submodule status`). bench/check-pins.sh fails when they differ.
ARG TEMPLATE_COMMIT=18d17934fec6e49df7c28ff720f4d318c8c3e710
ARG PLAYWRIGHT_VERSION=1.64.1

ENV TZ=UTC CI=1

RUN git clone https://github.com/cpeaustriajc/tanstack-start-todo.git /app \
 && git -C /app checkout --detach "$TEMPLATE_COMMIT" \
 && git -C /app config user.name "bench" \
 && git -C /app config user.email "bench@localhost"

WORKDIR /app
RUN npm ci

# Grader browser. The hidden tests are uploaded to /tests only after the agent stops.
WORKDIR /opt/grader
RUN npm init -y >/dev/null \
 && npm install "playwright@$PLAYWRIGHT_VERSION" \
 && npx playwright install --with-deps chromium

WORKDIR /app
