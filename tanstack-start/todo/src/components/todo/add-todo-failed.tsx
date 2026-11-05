import { Button } from "#/components/ui/button.tsx";
import type { ReactElement } from "react";

type Props = Readonly<{ onRetry: () => void }>;

const FAILED_MESSAGE = "Could not add the todo.";
const RETRY_TEXT = "Retry";

const AddTodoFailed = ({ onRetry }: Props): ReactElement => (
  <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
    {FAILED_MESSAGE}
    <Button onPress={onRetry} size="sm" variant="outline">
      {RETRY_TEXT}
    </Button>
  </p>
);

export { AddTodoFailed };
