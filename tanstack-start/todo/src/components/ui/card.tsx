import type { ReactElement, ReactNode } from "react";

type CardProps = Readonly<{ children: ReactNode }>;

const Card = ({ children }: CardProps): ReactElement => (
  <div
    className="group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)]"
    data-slot="card"
  >
    {children}
  </div>
);

export { Card };
