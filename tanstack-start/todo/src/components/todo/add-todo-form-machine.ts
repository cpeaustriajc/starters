import { Effect, Schema } from "effect";
import { assign, fromPromise, setup } from "xstate";
import { NewTodo } from "#/domain/todo.ts";
import { addTodo } from "#/server/todo-functions.ts";

type Refresh = () => Promise<void>;

const addTodoFormMachine = setup({
  actors: {
    submit: fromPromise(
      ({ input }: Readonly<{ input: Readonly<{ refresh: Refresh; todo: NewTodo }> }>) =>
        Effect.runPromise(
          Effect.gen(function* submit() {
            yield* Effect.promise(() => addTodo({ data: input.todo }));
            yield* Effect.promise(() => input.refresh());
          }),
        ),
    ),
  },
  guards: { hasTitle: ({ context }) => Schema.is(NewTodo)({ title: context.title }) },
  types: {
    context: {} as { refresh: Refresh; title: string },
    events: {} as { type: "CHANGE"; title: string } | { type: "RETRY" } | { type: "SUBMIT" },
    input: {} as { refresh: Refresh },
  },
}).createMachine({
  context: ({ input }) => ({ refresh: input.refresh, title: "" }),
  id: "addTodoForm",
  initial: "editing",
  states: {
    editing: {
      on: {
        CHANGE: { actions: assign({ title: ({ event }) => event.title }) },
        SUBMIT: { guard: "hasTitle", target: "submitting" },
      },
    },
    failed: {
      on: {
        CHANGE: { actions: assign({ title: ({ event }) => event.title }), target: "editing" },
        RETRY: "submitting",
      },
    },
    submitting: {
      invoke: {
        input: ({ context }) => ({ refresh: context.refresh, todo: { title: context.title } }),
        onDone: { actions: assign({ title: "" }), target: "editing" },
        onError: "failed",
        src: "submit",
      },
    },
  },
});

export { addTodoFormMachine };
