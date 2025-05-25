"use client";

import React, { forwardRef, useCallback, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type OptionType = {
  value: string;
  label: string;
};

type SelectProps = {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
  options: OptionType[];
  placeholder?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">;

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      variant = "primary",
      size = "md",
      disabled,
      loading,
      error,
      className,
      options,
      placeholder = "Select an option",
      label,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    // 使用受控模式，直接從 props 讀取值
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 處理點擊外部事件的回調，使用 useCallback 避免重新創建
    const handleClickOutside = useCallback(
      (event: MouseEvent) => {
        if (
          isOpen &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      },
      [isOpen],
    );

    // 點擊外部關閉下拉選單 - 僅在需要時掛載事件
    if (typeof window !== "undefined" && isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
      // 確保組件卸載或選單關閉時清理
      window.addEventListener("mousedown", function cleanup() {
        if (!isOpen) {
          window.removeEventListener("mousedown", handleClickOutside);
          window.removeEventListener("mousedown", cleanup);
        }
      });
    }

    const toggleDropdown = () => {
      if (!disabled && !loading) {
        setIsOpen(!isOpen);
      }
    };

    const handleOptionSelect = (option: OptionType) => {
      onChange?.(option.value);
      setIsOpen(false);
    };

    // 選擇的選項 - 直接從 props 讀取 value
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className="w-full" ref={ref} {...props}>
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative" ref={dropdownRef}>
          <div
            className={cn(
              "flex w-full cursor-pointer items-center justify-between rounded-md border bg-white px-3 transition-all focus:outline-none",
              {
                "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300":
                  variant === "primary" && !error,
                "border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-300":
                  variant === "secondary" && !error,
                "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-300":
                  variant === "danger" || error,
              },
              {
                "py-1.5 text-sm": size === "sm",
                "py-2 text-base": size === "md",
                "py-2.5 text-lg": size === "lg",
              },
              {
                "cursor-not-allowed bg-gray-100 opacity-60":
                  disabled || loading,
              },
              className,
            )}
            onClick={toggleDropdown}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                toggleDropdown();
                e.preventDefault();
              }
            }}
          >
            <span className={cn({ "text-gray-400": !value })}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span
              className={cn(
                "transform transition-transform",
                isOpen ? "rotate-180" : "",
              )}
            >
              ▼
            </span>
          </div>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn("cursor-pointer px-3 py-2 hover:bg-gray-100", {
                    "bg-blue-50 text-blue-600": option.value === value,
                  })}
                  onClick={() => handleOptionSelect(option)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleOptionSelect(option);
                      e.preventDefault();
                    }
                  }}
                  tabIndex={0}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}

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

Select.displayName = "Select";
