import { CheckIcon } from "lucide-react";
import type { ReactElement } from "react";

const CheckboxIndicator = (): ReactElement => (
  <span
    className="grid size-4 shrink-0 place-content-center rounded-[4px] border border-input transition-colors group-data-focus-visible:border-ring group-data-focus-visible:ring-3 group-data-focus-visible:ring-ring/50 group-data-selected:border-primary group-data-selected:bg-primary group-data-selected:text-primary-foreground group-data-disabled:opacity-50 dark:bg-input/30"
    data-slot="checkbox-indicator"
  >
    <CheckIcon className="hidden size-3.5 group-data-selected:block" />
  </span>
);

export { CheckboxIndicator };
