import type { ReactElement, SyntheticEvent } from "react";
import { AddTodoFailed } from "#/components/todo/add-todo-failed.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Form } from "#/components/ui/form.tsx";
import { TextField } from "#/components/ui/text-field.tsx";
import { addTodoFormMachine } from "#/components/todo/add-todo-form-machine.ts";
import { useCallback } from "react";
import { useMachine } from "@xstate/react";
import { useRouter } from "@tanstack/react-router";

const NEW_TODO_LABEL = "New todo";
const NEW_TODO_PLACEHOLDER = "What needs doing?";
const ADD_TEXT = "Add";

const AddTodoForm = (): ReactElement => {
  const router = useRouter();
  const [snapshot, send] = useMachine(addTodoFormMachine, {
    input: { refresh: (): Promise<void> => router.invalidate() },
  });
  const change = useCallback(
    (title: string) => {
      send({ title, type: "CHANGE" });
    },
    [send],
  );
  const submit = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault();
      send({ type: "SUBMIT" });
    },
    [send],
  );
  const retry = useCallback(() => {
    send({ type: "RETRY" });
  }, [send]);

  return (
    <Form onSubmit={submit}>
      <div className="flex gap-2">
        <TextField
          aria-label={NEW_TODO_LABEL}
          isDisabled={snapshot.matches("submitting")}
          onChange={change}
          placeholder={NEW_TODO_PLACEHOLDER}
          value={snapshot.context.title}
        />
        <Button isDisabled={snapshot.matches("submitting")} type="submit">
          {ADD_TEXT}
        </Button>
      </div>
      {snapshot.matches("failed") && <AddTodoFailed onRetry={retry} />}
    </Form>
  );
};

export { AddTodoForm };
