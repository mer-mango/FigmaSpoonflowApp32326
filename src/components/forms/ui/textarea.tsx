import * as React from "react";

import { cn } from "./utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!);
    
    // Auto-resize function
    const autoResize = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set height to scrollHeight to fit content
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    }, []);
    
    // Auto-resize on mount and when value changes
    React.useEffect(() => {
      autoResize();
    }, [props.value, autoResize]);
    
    // Handle input events
    const handleInput = React.useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
      autoResize();
      if (props.onInput) {
        props.onInput(e);
      }
    }, [autoResize, props.onInput]);
    
    return (
      <textarea
        ref={textareaRef}
        data-slot="textarea"
        className={cn(
          "resize-none placeholder:text-muted-foreground flex min-h-16 w-full rounded-md border border-[#ddecf0] bg-[#f5fafb] px-4 py-3 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere overflow-hidden",
          "focus-visible:border-[#2f829b] focus-visible:ring-[#2f829b]/20 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
        onInput={handleInput}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };