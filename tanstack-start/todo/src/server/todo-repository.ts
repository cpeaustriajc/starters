import { Config, Context, DateTime, Effect, Layer, Schema } from "effect";
import type { NewTodo, TodoRef } from "#/domain/todo.ts";
import { Todo, TodoList } from "#/domain/todo.ts";
import Database from "better-sqlite3";
import { TodoStoreError } from "#/server/todo-store-error.ts";

interface TodoRepositoryShape {
  readonly add: (todo: NewTodo) => Effect.Effect<Todo, TodoStoreError>;
  readonly complete: (ref: TodoRef) => Effect.Effect<void, TodoStoreError>;
  readonly list: Effect.Effect<readonly Todo[], TodoStoreError>;
}

const toStoreError = (cause: unknown): TodoStoreError => TodoStoreError.make({ cause });
const attempt = <Value>(run: () => Value): Effect.Effect<Value, TodoStoreError> =>
  Effect.try({ catch: toStoreError, try: run });
const openDatabase = Effect.gen(function* openDatabase() {
  const path = yield* Config.String("TODO_DB").pipe(Config.withDefault("todos.db"));
  const sqlite = yield* Effect.acquireRelease(
    attempt(() => new Database(path)),
    (opened) => Effect.sync(() => opened.close()),
  );
  yield* attempt(() =>
    sqlite.exec(
      "CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, done_at TEXT)",
    ),
  );
  return sqlite;
});
const makeTodoRepository = Effect.gen(function* makeTodoRepository() {
  const sqlite = yield* openDatabase;
  const insert = sqlite.prepare(
    "INSERT INTO todos (title) VALUES (?) RETURNING id, title, done_at AS doneAt",
  );
  const markDone = sqlite.prepare("UPDATE todos SET done_at = ? WHERE id = ? AND done_at IS NULL");
  const selectAll = sqlite.prepare("SELECT id, title, done_at AS doneAt FROM todos ORDER BY id");
  const repository: TodoRepositoryShape = {
    add: ({ title }) =>
      attempt(() => insert.get(title)).pipe(
        Effect.flatMap(Schema.decodeUnknownEffect(Todo)),
        Effect.mapError(toStoreError),
      ),
    complete: ({ id }) =>
      DateTime.now.pipe(
        Effect.map(DateTime.formatIso),
        Effect.flatMap((doneAt) => attempt(() => markDone.run(doneAt, id))),
        Effect.asVoid,
      ),
    list: attempt(() => selectAll.all()).pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(TodoList)),
      Effect.mapError(toStoreError),
    ),
  };
  return repository;
});

class TodoRepository extends Context.Service<TodoRepository, TodoRepositoryShape>()(
  "todo/server/todo-repository/TodoRepository",
) {
  public static readonly layer = Layer.effect(TodoRepository, makeTodoRepository);
}

export { TodoRepository };
