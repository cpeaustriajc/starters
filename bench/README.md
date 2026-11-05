# bench

Feature tasks for each template, run under several agent harnesses with
[Harbor](https://github.com/harbor-framework/harbor) (PyPI `harbor` 0.25.0). Grading reads only
the result in the container (the repo and the running app), never a harness transcript.

## State

The grader works on a Claude Code cloud session (4 CPUs, 15 GiB): the untouched template scores
`verify` 1, `e2e` 0, reward 0, for the right reason. See [Cloud run](#cloud-run-2026-11-05).
No agent run counts yet, and the task has no reference solution for `oracle`.

| Step | Result |
|---|---|
| Image build (`environment/Dockerfile`) | passes; about 2 min on the cloud session after the base image is pulled |
| Grader on the untouched template (`nop` agent) | reward 0: `verify` 1, `e2e` 0, `FAIL: no due date field on the page` |
| `oracle` run | no `solution/` in the task, so nothing to run |
| `claude-code` run | not run |
| `codex` run | not run |

### Why the local runs were blocked

Colima here has 2 CPUs, 2 GB of memory and no swap (`vm.overcommit_memory = 0`). The
template's oxlint config loads a JS plugin (`eslint-plugin-no-comments`), and oxlint's JS-plugin
path reserves 4 GiB of virtual memory per thread (`oxc_allocator/src/pool/fixed_size.rs`). The
kernel refuses one reservation larger than RAM plus swap, so `npm run verify` aborts in every
container on this VM:

```text
thread 'tokio-rt-worker' (130) panicked at crates/oxc_allocator/src/pool/fixed_size.rs:112:67:
called `Result::unwrap()` on an `Err` value: ()
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
Aborted (core dumped)
```

`--threads 1` and a 6 GB container limit (`docker run -m 6g`) abort the same way. In the same
run the dev server did not answer in 180 s (`FAIL: no answer from http://localhost:3000 in 180
s`); the small VM is the probable cause, not yet confirmed.

The first try also failed before the grader, because `task.toml` asked for 4 CPUs:
`Error response from daemon: range of CPUs is from 0.01 to 2.00, as there are only 2 CPUs
available`. The task now leaves CPU and memory to the provider.

## Task: `tasks/due-dates`

| File | Holds |
|---|---|
| `instruction.md` | "Add an optional due date to each todo, shown on the page, accepted by the API and the CLI." |
| `task.toml` | timeouts; shared verifier; workdir `/app` |
| `environment/Dockerfile` | `mcr.microsoft.com/playwright:v1.64.1-noble` (Ubuntu noble, Node 26, Chromium for Playwright 1.64.1 with its system libraries), the template cloned at `TEMPLATE_COMMIT`, `npm ci`, the Playwright driver in `/opt/grader` |
| `tests/test.sh` | `git add -A`, then `npm run verify`, then `tests/e2e.mjs`; writes `/logs/verifier/reward.json` |
| `tests/e2e.mjs` | hidden browser check: starts `npm run dev` on a fresh `TODO_DB`, adds a todo with due date 2027-03-14 on the page, reloads, and looks for the date in the todo's row |

`reward = verify × e2e`; `reward.json` also holds `verify` and `e2e`.

Grading choices:

- `git add -A` runs first: `migrations:check` counts untracked migration files as missing, and
  staging is not part of the result.
- The e2e check finds the due date field as `input[type=date]`, React Aria date segments
  (`spinbutton`), an input labelled /due/, or an input named `due*`, in that order. It accepts
  the date as `2027-03-14`, `Mar 14`, `14 Mar`, `3/14/2027` or `14/03/2027`.
- The verifier shares the agent's container (`harbor lint` warns about this). Harbor uploads
  `tests/` only after the agent stops, so the agent cannot read them, but it can change
  `/opt/grader`. A separate verifier container needs `/app` passed as an artifact; do this
  before results count.

`check-pins.sh` fails when a task image clones a template at a commit other than the hub's
submodule pin. Run it after each submodule bump.

The image was `node:26-bookworm` plus `npx playwright install --with-deps chromium`. That step
downloads from cdn.playwright.dev and deb.debian.org, which hosts behind an egress allowlist
cannot reach; Microsoft's Playwright image already holds the matching Chromium and its
libraries, and Node 26. The Dockerfile fails the build if the base image moves off Node 26.
`EXTRA_CA_CERT_B64` (empty by default) lets a proxied host trust its interception CAs during
the build; see `overlays/`.

## Run

```bash
uv tool install harbor
```

```bash
bench/check-pins.sh
```

Prove the grader fails on the untouched template (expect `verify` 1, `e2e` 0, and
`FAIL: no due date field on the page` in `verifier/e2e.log`):

```bash
harbor run -p bench/tasks/due-dates -a nop -o bench/jobs --job-name nop-untouched
```

Codex, signed in through `~/.codex/auth.json`:

```bash
CODEX_FORCE_AUTH_JSON=1 harbor run -p bench/tasks/due-dates -a codex -o bench/jobs --job-name codex
```

Claude Code, with the token read from 1Password only for this command:

```bash
CLAUDE_CODE_OAUTH_TOKEN="${CLAUDE_CODE_OAUTH_TOKEN:-$(op read 'op://Personal/Claude Code OAuth token/credential')}" harbor run -p bench/tasks/due-dates -a claude-code -o bench/jobs --job-name claude-code
```

On a host whose only egress is a local HTTPS proxy (a Claude Code cloud session), use the
wrapper instead; it builds the image with host networking and the session's CAs, then runs
Harbor with `overlays/agent-proxy.yaml`:

```bash
bench/overlays/agent-proxy-run.sh bench/tasks/due-dates -a nop -o bench/jobs --job-name nop-untouched
```

Each trial writes `bench/jobs/<job>/<trial>/result.json` (reward, timings, tokens and cost when
the agent reports them) and `verifier/{verify.log,e2e.log,e2e.png,reward.json}`. `bench/jobs/`
is not tracked. `harbor view bench/jobs` browses the results.

## Cloud run (2026-11-05)

A Claude Code cloud session, Ubuntu 24.04, `starters` at 377f366f with the submodule at
18d17934. The steps below ran in order; each shows the command and the output that matters.

### VM and Docker

```text
$ nproc
4
$ free -g
               total        used        free      shared  buff/cache   available
Mem:              15           0          15           0           0          15
Swap:              0           0           0
$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda        252G  8.5G   31G  22% /
```

No swap, `vm.overcommit_memory = 0`, as on the laptop; with 15 GiB the 4 GiB reservations of
oxlint's JS-plugin path fit, and `npm run verify` finished in the container (below).

Docker 29.9.2 is installed but no daemon runs. Started by hand, without a bridge (the sandbox
does not allow IP forwarding or iptables changes) and with a registry mirror, because anonymous
pulls from Docker Hub answered `429 Too Many Requests`:

```bash
dockerd --iptables=false --ip6tables=false --bridge=none --registry-mirror=https://mirror.gcr.io &
```

```text
$ docker run --rm hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
Status: Downloaded newer image for hello-world:latest
WARNING: IPv4 forwarding is disabled. Networking will not work.

Hello from Docker!
This message shows that your installation appears to be working correctly.
```

Containers have no network of their own, so builds and runs use the host network and reach the
session's proxy at `127.0.0.1:34339` (`HTTPS_PROXY`). The proxy allows github.com,
registry.npmjs.org, nodejs.org, mirror.gcr.io, public.ecr.aws and mcr.microsoft.com; it denies
cdn.playwright.dev, playwright.download.prss.microsoft.com, playwright-akamai.azureedge.net,
deb.debian.org and dl.google.com (`403` on CONNECT). Hosts in `NO_PROXY` (registry.npmjs.org
among them) go direct but are still TLS-intercepted, by a different CA than the proxy's; the
image therefore trusts every Anthropic CA from `/root/.ccr/ca-bundle.crt`, which
`overlays/agent-proxy-run.sh` extracts.

### Tools

Node 26.13.0 from the nodejs.org tarball into `/usr/local` (the session ships Node 22 in
`/opt/node22`, ahead on `PATH`, so prefix `PATH=/usr/local/bin:$PATH`). `uv tool install
harbor` gave Harbor 0.25.0 (uv 0.11.32).

### Grader on the untouched template

Harbor's `docker compose build` goes through bake, which refuses `build.network: host` without
an `--allow` flag Harbor does not pass (`COMPOSE_BAKE=false` and `build.entitlements` changed
nothing with Compose v5.6.1). The wrapper builds the image with `docker build --network host`
and the overlay replaces the build with that image (`build: !reset null`).

```bash
PATH=/usr/local/bin:$PATH bench/overlays/agent-proxy-run.sh bench/tasks/due-dates -a nop -o bench/jobs --job-name nop-untouched
```

Image build 1 min 52 s with the base image already pulled; the trial itself 32 s.

```text
adhoc • nop
┏━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━┳━━━━━━━━┳━━━━━━━━┓
┃ Trials ┃ Exceptions ┃   E2E ┃ Reward ┃ Verify ┃
┡━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━╇━━━━━━━━╇━━━━━━━━┩
│      1 │          0 │ 0.000 │  0.000 │  1.000 │
└────────┴────────────┴───────┴────────┴────────┘
```

`verifier/reward.json`:

```json
{"reward": 0, "verify": 1, "e2e": 0}
```

`verifier/verify.log`, all gates green, oxlint included:

```text
> todo@0.4.0 verify
> tsr generate && npm run --silent migrations:check && oxfmt --check && effect-tsgo oxlint --type-aware && effect-tsgo tsc -p tsconfig.json && effect-tsgo tsrs -p tsconfig.json && vitest run --passWithNoTests
No schema changes, nothing to migrate
Everything's fine
All matched files use the correct format.
Finished in 52ms on 49 files using 4 threads.
Found 0 warnings and 0 errors.
Finished in 2.2s on 39 files with 625 rules using 4 threads.
No test files found, exiting with code 0
```

`verifier/e2e.log`, the dev server answered and the hidden check failed where it should:

```text
> todo@0.4.0 dev
> vite dev --port 3000
  VITE v8.3.6  ready in 929 ms
  ➜  Local:   http://localhost:3000/
FAIL: no due date field on the page
```

### Oracle

Not run: `tasks/due-dates` has no `solution/solve.sh`, and Harbor's `oracle` agent needs one.
