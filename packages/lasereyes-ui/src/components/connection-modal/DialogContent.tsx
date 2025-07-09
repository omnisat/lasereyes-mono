import { ReactNode } from "react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

export default function DialogContent({
  children,
  className,
}: {
  children: ReactNode | ReactNode[];
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "lem-max-w-2xl lem-max-h-screen lem-w-full lem-rounded-none lem-rounded-t-3xl sm:lem-rounded-3xl lem-mx-auto",
        className
      )}
    >
      <div className="sm:lem-hidden lem-h-1 lem-rounded-full lem-bg-border lem-w-10 lem-mx-auto lem-mt-2" />
      {children}
    </Card>
  );
}
