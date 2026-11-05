# templates

Project templates for personal projects, and a benchmark of how well each ecosystem steers a
coding agent to good code by default.

| Template | Stack | State |
|---|---|---|
| [`tanstack-start-todo`](https://github.com/cpeaustriajc/tanstack-start-todo) (submodule) | TanStack Start, Effect, React Aria (shadcn), oxlint, TypeScript 7 | baseline; rebuild to the agreed design in progress |
| `nextjs-todo` | Next.js 16, Effect, nuqs, next-safe-action | planned |

Each template is a todo app: a web page, a JSON API and a CLI. A todo app is small enough to
read in full and still has client state, server state, storage and validation.

## Benchmark

`bench/` (planned) gives the same feature tasks to an agent in each template, with no user rules,
and grades the result: hidden end-to-end tests in a real browser, the template's own gates, and
counts of gate escapes (disable comments, config edits, type casts, boundary imports). Every
grader must fail on a known-bad change before its results count.
