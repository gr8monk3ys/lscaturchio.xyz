import * as React from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => (
    <textarea
      autoComplete="off"
      ref={ref}
      name="message"
      className={cn(
        "w-full resize-none rounded-lg bg-background px-4 py-3 text-sm text-foreground",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
        "min-h-[52px] max-h-40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
