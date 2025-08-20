import { cn } from "../../lib/utils";

// Use tailwindcss for styling and animations. Tailwindcss has a configuration of 'lem-' prefix
export default function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "lem-w-[1.2em] lem-h-[1.2em] lem-border lem-border-t-0 lem-border-current lem-border-solid lem-rounded-full lem-animate-spin",
        className
      )}
    />
  );
}
