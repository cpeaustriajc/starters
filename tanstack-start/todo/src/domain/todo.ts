import { Schema } from "effect";
import { TodoId } from "#/domain/todo-id.ts";

class Todo extends Schema.Class<Todo, { readonly brand: unique symbol }>("Todo")({
  doneAt: Schema.OptionFromNullOr(Schema.DateTimeUtcFromString),
  id: TodoId,
  title: Schema.NonEmptyString,
}) {}

const NewTodo = Schema.Struct({ title: Todo.fields.title });
const TodoList = Schema.Array(Todo);
const TodoRef = Schema.Struct({ id: Todo.fields.id });

type NewTodo = typeof NewTodo.Type;
type TodoRef = typeof TodoRef.Type;

export { NewTodo, Todo, TodoList, TodoRef };
