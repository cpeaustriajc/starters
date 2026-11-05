import { fromPromise, setup } from "xstate";
import type { TodoRef } from "#/domain/todo.ts";
import { completeTodo } from "#/server/todo-functions.ts";

const todoItemMachine = setup({
  actors: {
    complete: fromPromise(({ input }: Readonly<{ input: TodoRef }>) =>
      completeTodo({ data: input }),
    ),
  },
  guards: { isDone: ({ context }) => context.isDone },
  types: {
    context: {} as { isDone: boolean; ref: TodoRef },
    events: {} as { type: "COMPLETE" },
    input: {} as { isDone: boolean; ref: TodoRef },
  },
}).createMachine({
  context: ({ input }) => input,
  id: "todoItem",
  initial: "start",
  states: {
    completing: {
      invoke: {
        input: ({ context }) => context.ref,
        onDone: "done",
        onError: "failed",
        src: "complete",
      },
    },
    done: { type: "final" },
    failed: { on: { COMPLETE: "completing" } },
    open: { on: { COMPLETE: "completing" } },
    start: { always: [{ guard: "isDone", target: "done" }, { target: "open" }] },
  },
});

export { todoItemMachine };
