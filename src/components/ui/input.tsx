import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-400/75 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300 [&>span]:line-clamp-1",
          className,
        )}
        ref={ref}
        {...props}
        onFocus={(e) => {
          if (type === "date" || type === "time") {
            e.target.showPicker();
          }
          props.onFocus?.(e);
        }}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
