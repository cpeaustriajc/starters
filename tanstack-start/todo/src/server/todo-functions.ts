import { Effect, Schema } from "effect";
import { NewTodo, TodoRef } from "#/domain/todo.ts";
import { TodoRepository } from "#/server/todo-repository.ts";
import { createServerFn } from "@tanstack/react-start";
import { runtime } from "#/server/runtime.ts";

const listTodos = createServerFn({ method: "GET" }).handler(() =>
  runtime.runPromise(
    Effect.gen(function* list() {
      const todos = yield* TodoRepository;
      return yield* todos.list;
    }),
  ),
);
const addTodo = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(NewTodo))
  .handler(({ data }) =>
    runtime.runPromise(
      Effect.gen(function* add() {
        const todos = yield* TodoRepository;
        return yield* todos.add(data);
      }),
    ),
  );
const completeTodo = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(TodoRef))
  .handler(({ data }) =>
    runtime.runPromise(
      Effect.gen(function* complete() {
        const todos = yield* TodoRepository;
        yield* todos.complete(data);
      }),
    ),
  );

export { addTodo, completeTodo, listTodos };
