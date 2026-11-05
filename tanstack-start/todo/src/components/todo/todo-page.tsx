import type { ReactElement } from "react";
import type { Todo } from "#/domain/todo.ts";
import { TodoCard } from "#/components/todo/todo-card.tsx";

type Props = Readonly<{ todos: readonly Todo[] }>;

const TodoPage = ({ todos }: Props): ReactElement => (
  <main className="mx-auto max-w-md p-6">
    <TodoCard todos={todos} />
  </main>
);

export { TodoPage };
