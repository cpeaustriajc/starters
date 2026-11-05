import type { ReactElement, ReactNode } from "react";

type CardContentProps = Readonly<{ children: ReactNode }>;

const CardContent = ({ children }: CardContentProps): ReactElement => (
  <div className="flex flex-col gap-4 px-(--card-spacing)" data-slot="card-content">
    {children}
  </div>
);

export { CardContent };
