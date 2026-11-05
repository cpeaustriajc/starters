import { Checkbox } from "#/components/ui/checkbox.tsx";
import { Option } from "effect";
import type { ReactElement } from "react";
import type { Todo } from "#/domain/todo.ts";
import { todoItemMachine } from "#/components/todo/todo-item-machine.ts";
import { useCallback } from "react";
import { useMachine } from "@xstate/react";

type Props = Readonly<{ todo: Todo }>;

const FAILED_MESSAGE = "Could not save. Click to try again.";

const TodoItem = ({ todo }: Props): ReactElement => {
  const [snapshot, send] = useMachine(todoItemMachine, {
    input: { isDone: Option.isSome(todo.doneAt), ref: { id: todo.id } },
  });
  const isChecked = snapshot.matches("done") || snapshot.matches("completing");
  const complete = useCallback(() => {
    send({ type: "COMPLETE" });
  }, [send]);

  return (
    <li className="flex flex-col gap-1">
      <Checkbox isDisabled={isChecked} isSelected={isChecked} onChange={complete}>
        {todo.title}
      </Checkbox>
      {snapshot.matches("failed") && (
        <p className="text-sm text-destructive" role="alert">
          {FAILED_MESSAGE}
        </p>
      )}
    </li>
  );
};

export { TodoItem };
