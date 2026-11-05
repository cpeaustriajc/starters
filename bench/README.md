# bench

Feature tasks for each template, run under several agent harnesses with
[Harbor](https://github.com/harbor-framework/harbor) (PyPI `harbor` 0.25.0). Grading reads only
the result in the container (the repo and the running app), never a harness transcript.

## State

The local runs are blocked on the Docker VM size. Run the bench on a host where Docker has more
than 4 GiB of memory (for example a cloud session). No grader result and no agent run counts yet.

| Step | Result |
|---|---|
| Image build (`environment/Dockerfile`) | passes, about 4 min cold |
| Grader on the untouched template (`nop` agent) | reward 0, but for the wrong reason: see below |
| `claude-code` run | not run |
| `codex` run | not run |

### Why the local runs are blocked

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
| `environment/Dockerfile` | `node:26-bookworm`, the template cloned at `TEMPLATE_COMMIT`, `npm ci`, Playwright 1.64.1 with Chromium in `/opt/grader` |
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

Each trial writes `bench/jobs/<job>/<trial>/result.json` (reward, timings, tokens and cost when
the agent reports them) and `verifier/{verify.log,e2e.log,e2e.png,reward.json}`. `bench/jobs/`
is not tracked. `harbor view bench/jobs` browses the results.
