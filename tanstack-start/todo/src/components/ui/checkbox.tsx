import { CheckboxButton, CheckboxField } from "react-aria-components";
import type { ReactElement, ReactNode } from "react";
import type { CheckboxFieldProps } from "react-aria-components";
import { CheckboxIndicator } from "#/components/ui/checkbox-indicator.tsx";

type CheckboxProps = Readonly<
  Pick<CheckboxFieldProps, "isDisabled" | "isSelected" | "onChange"> & { children: ReactNode }
>;

const Checkbox = ({ children, ...props }: CheckboxProps): ReactElement => (
  <CheckboxField data-slot="checkbox" {...props}>
    <CheckboxButton className="group flex items-center gap-2 text-sm data-disabled:cursor-not-allowed">
      <CheckboxIndicator />
      {children}
    </CheckboxButton>
  </CheckboxField>
);

export { Checkbox };
