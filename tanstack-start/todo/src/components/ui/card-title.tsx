import type { ReactElement, ReactNode } from "react";

type CardTitleProps = Readonly<{ children: ReactNode }>;

const CardTitle = ({ children }: CardTitleProps): ReactElement => (
  <h2 className="font-heading text-base leading-snug font-medium" data-slot="card-title">
    {children}
  </h2>
);

export { CardTitle };
