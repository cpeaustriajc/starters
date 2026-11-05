import type { ReactElement, ReactNode } from "react";

type CardHeaderProps = Readonly<{ children: ReactNode }>;

const CardHeader = ({ children }: CardHeaderProps): ReactElement => (
  <div
    className="group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing)"
    data-slot="card-header"
  >
    {children}
  </div>
);

export { CardHeader };
