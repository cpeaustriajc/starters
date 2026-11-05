import { AddTodoForm } from "#/components/todo/add-todo-form.tsx";
import { Card } from "#/components/ui/card.tsx";
import { CardContent } from "#/components/ui/card-content.tsx";
import { CardHeader } from "#/components/ui/card-header.tsx";
import { CardTitle } from "#/components/ui/card-title.tsx";
import type { ReactElement } from "react";
import type { Todo } from "#/domain/todo.ts";
import { TodoList } from "#/components/todo/todo-list.tsx";

type Props = Readonly<{ todos: readonly Todo[] }>;

const TITLE = "Todos";

const TodoCard = ({ todos }: Props): ReactElement => (
  <Card>
    <CardHeader>
      <CardTitle>{TITLE}</CardTitle>
    </CardHeader>
    <CardContent>
      <AddTodoForm />
      <TodoList todos={todos} />
    </CardContent>
  </Card>
);

export { TodoCard };
