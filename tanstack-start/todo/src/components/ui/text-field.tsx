import { Input } from "#/components/ui/input.tsx";
import type { ReactElement } from "react";
import { TextField as TextFieldPrimitive } from "react-aria-components";
import type { TextFieldProps } from "react-aria-components";

type Props = Readonly<
  Pick<TextFieldProps, "aria-label" | "isDisabled" | "onChange" | "value"> & {
    placeholder: string;
  }
>;

const TextField = ({ placeholder, ...props }: Props): ReactElement => (
  <TextFieldPrimitive className="flex w-full flex-col gap-1.5" data-slot="text-field" {...props}>
    <Input placeholder={placeholder} />
  </TextFieldPrimitive>
);

export { TextField };
