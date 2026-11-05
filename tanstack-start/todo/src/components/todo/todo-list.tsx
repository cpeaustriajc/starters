import { Array } from "effect";
import type { ReactElement } from "react";
import type { Todo } from "#/domain/todo.ts";
import { TodoItem } from "#/components/todo/todo-item.tsx";

type Props = Readonly<{ todos: readonly Todo[] }>;

const TodoList = ({ todos }: Props): ReactElement => (
  <ul className="flex flex-col gap-2">
    {Array.map(todos, (todo) => (
      <TodoItem key={todo.id} todo={todo} />
    ))}
  </ul>
);

export { TodoList };
