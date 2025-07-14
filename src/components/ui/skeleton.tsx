// Rule: UI and Styling - Use Shadcn UI and Radix for components
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-stone-200 dark:bg-stone-700 shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.03),-0.5px_-0.5px_1px_rgba(255,255,255,0.4)] dark:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.1),-0.25px_-0.25px_0.5px_rgba(255,255,255,0.01)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
