import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

type ButtonProps = {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      disabled,
      loading,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex transform cursor-pointer items-center justify-center rounded-md font-bold transition-all select-none active:scale-95",
          {
            "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300":
              variant === "primary",
            "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-300":
              variant === "secondary",
            "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300":
              variant === "danger",
          },
          {
            "px-5 py-2 text-sm": size === "sm",
            "px-7 py-2.5 text-base": size === "md",
            "px-9 py-2.5 text-lg": size === "lg",
          },
          {
            "cursor-not-allowed opacity-60": disabled || loading,
          },
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span
            className={cn(
              "absolute animate-spin rounded-full border-2 border-current border-t-transparent",
              {
                "h-4 w-4": size === "sm",
                "h-5 w-5": size === "md",
                "h-6 w-6": size === "lg",
              },
            )}
          />
        )}
        <span className={cn({ "opacity-0": loading })}>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
