# todo

A todo list with three ways in: a web page, a JSON API and a CLI. All three use one SQLite file.

| Way in   | Entry                                              |
| -------- | -------------------------------------------------- |
| Web page | `npm run dev`, then <http://localhost:3000>        |
| JSON API | `GET` and `POST` `/api/todos` (`{"title": "..."}`) |
| CLI      | `node src/cli.ts add <title>`, `list`, `done <id>` |

`TODO_DB` sets the database file (default `todos.db`).

## Stack

- TanStack Start: routes, server functions, server routes and SSR.
- Effect (stable modules only): `Schema` is the one source of types; `Context.Service` and `Layer`
  hold the repository.
- better-sqlite3 for storage.
- XState for the state of the add form and of each todo.
- shadcn/ui on the React Aria base, in `src/components/ui`.
- commander for the CLI.

## Gates

`npm run verify` runs them all, and `.githooks/pre-commit` runs `verify` before each commit
(`git config core.hooksPath .githooks`):

1. `tsr generate`
2. `oxfmt --check`
3. `effect-tsgo oxlint --type-aware`: every category except nursery at error, comments banned.
4. `effect-tsgo tsc`: TypeScript 7, every strict flag, every Effect diagnostic at error.
5. `effect-tsgo tsrs`
6. `vitest run`

## Settings below the strictest

Config files cannot hold comments here, so each relaxed setting has its reason below.

| Setting                                                                                                | Reason                                                                                                                             |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `skipLibCheck: true`                                                                                   | declaration errors inside react-aria-components, xstate, babel and unplugin fail the build and cannot be fixed in this repo        |
| `import/no-named-export`, `import/prefer-default-export` off                                           | they contradict `import/no-default-export`; named exports win                                                                      |
| `react/react-in-jsx-scope` off                                                                         | the JSX runtime is `react-jsx`                                                                                                     |
| `oxc/no-rest-spread-properties` off                                                                    | it guards old runtimes; the target is ESNext, and the ui wrappers pass rest props on                                               |
| `eslint/new-cap` off                                                                                   | Effect's class factories are capitalized calls without `new`: `Schema.TaggedError<…>()`, `Schema.Defect()`, `Context.Service<…>()` |
| `eslint/no-redeclare` off                                                                              | a Schema value and its type share a name (`NewTodo`)                                                                               |
| `eslint/one-var` off                                                                                   | not recommended by ESLint or oxlint; `always` chains components with constants, and `never` fights more than it helps              |
| `eslint/sort-vars` off                                                                                 | it reorders declarations that depend on each other                                                                                 |
| `typescript/promise-function-async` off                                                                | it contradicts `oxc/no-async-await`                                                                                                |
| `unicorn/no-array-method-this-argument` off                                                            | it reads Effect's `Array.map(self, f)` as a `thisArg`; Effect's `preferEffectArray` already bans native `.map`                     |
| `no-comments` allows `/usr/bin/env node`                                                               | the CLI's hashbang is not a comment, but the plugin reads it as one                                                                |
| `node/no-top-level-await` ignores bin files                                                            | the CLI awaits its runtime and parse at top level                                                                                  |
| `node/no-sync` ignores `runSync`                                                                       | TanStack serialization adapters are synchronous; `runSync` runs a pure Schema codec, not I/O                                       |
| readonly-parameter allow list: `ReactNode`, `SyntheticEvent`, Effect's `Effect`, `None`, `Some`, `Utc` | these types are immutable in use but not marked `readonly` in their declarations                                                   |
| `src/components/ui/**`: `forbid-component-props`, `jsx-props-no-spreading` off                         | a shadcn wrapper sets the class names and passes the rest to React Aria                                                            |
| `src/routes/**`: `react/only-export-components` off                                                    | a route file exports `Route`                                                                                                       |
| `vite.config.ts`: `import/no-default-export` off                                                       | Vite reads the default export                                                                                                      |
| `**/*-machine.ts`: `no-unsafe-type-assertion` off                                                      | XState types its context, events and input with `{} as T`                                                                          |
| `src/**/*-error.ts`: `unicorn/throw-new-error` off                                                     | `Schema.TaggedError<…>()` is a class factory call, not a thrown error                                                              |
| React Compiler not used                                                                                | its Vite path needs `@rolldown/plugin-babel` 0.x or an experimental Rust port; `useCallback` stays manual                          |
