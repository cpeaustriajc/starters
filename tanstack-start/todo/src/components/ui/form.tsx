import type { ReactElement, ReactNode } from "react";
import { Form as FormPrimitive } from "react-aria-components";
import type { FormProps as FormPrimitiveProps } from "react-aria-components";

type FormProps = Readonly<Pick<FormPrimitiveProps, "onSubmit"> & { children: ReactNode }>;

const Form = (props: FormProps): ReactElement => (
  <FormPrimitive className="flex flex-col gap-2" data-slot="form" {...props} />
);

export { Form };
