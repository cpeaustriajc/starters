import { Effect, Schema } from "effect";
import { NewTodo, Todo, TodoList } from "#/domain/todo.ts";
import { TodoRepository } from "#/server/todo-repository.ts";
import type { TodoStoreError } from "#/server/todo-store-error.ts";
import { createFileRoute } from "@tanstack/react-router";
import { runtime } from "#/server/runtime.ts";

const created = 201;
const badRequest = 400;
const decodeNewTodo = Schema.decodeEffect(Schema.fromJsonString(NewTodo));
const listResponse = Effect.gen(function* list() {
  const todos = yield* TodoRepository;
  const all = yield* todos.list;
  const body = yield* Schema.encodeEffect(TodoList)(all);
  return Response.json(body);
});
const addResponse = (
  todo: NewTodo,
): Effect.Effect<Response, Schema.SchemaError | TodoStoreError, TodoRepository> =>
  Effect.gen(function* add() {
    const todos = yield* TodoRepository;
    const added = yield* todos.add(todo);
    const body = yield* Schema.encodeEffect(Todo)(added);
    return Response.json(body, { status: created });
  });
const Route = createFileRoute("/api/todos")({
  server: {
    handlers: {
      GET: () => runtime.runPromise(listResponse),
      POST: ({ request }) =>
        runtime.runPromise(
          Effect.promise(() => request.text()).pipe(
            Effect.flatMap(decodeNewTodo),
            Effect.matchEffect({
              onFailure: ({ message }) =>
                Effect.succeed(Response.json({ error: message }, { status: badRequest })),
              onSuccess: addResponse,
            }),
          ),
        ),
    },
  },
});

export { Route };
