import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

type InputProps = {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "primary",
      size = "md",
      disabled,
      loading,
      error,
      className,
      icon,
      label,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-md border bg-white transition-all focus:ring-2 focus:outline-none",
              {
                "border-gray-300 focus:border-blue-500 focus:ring-blue-300":
                  variant === "primary" && !error,
                "border-gray-300 focus:border-gray-500 focus:ring-gray-300":
                  variant === "secondary" && !error,
                "border-red-300 focus:border-red-500 focus:ring-red-300":
                  variant === "danger" || error,
              },
              {
                "px-3 py-1.5 text-sm": size === "sm",
                "px-4 py-2 text-base": size === "md",
                "px-5 py-2.5 text-lg": size === "lg",
              },
              {
                "cursor-not-allowed bg-gray-100 opacity-60":
                  disabled || loading,
                "pl-10": icon,
              },
              className,
            )}
            disabled={disabled || loading}
            {...props}
          />
          {loading && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span
                className={cn(
                  "animate-spin rounded-full border-2 border-current border-t-transparent text-gray-400",
                  {
                    "h-4 w-4": size === "sm",
                    "h-5 w-5": size === "md",
                    "h-6 w-6": size === "lg",
                  },
                )}
              />
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
