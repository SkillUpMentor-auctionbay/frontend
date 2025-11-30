"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon, type IconProps } from "./icon"

const Input = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string
    leftIcon?: IconProps["name"]
    rightIcon?: IconProps["name"]
    iconSize?: number
    onLeftIconClick?: () => void
    onRightIconClick?: () => void
    leftIconClickable?: boolean
    rightIconClickable?: boolean
    isPasswordVisible?: boolean
  }
>(({
  className,
  label,
  leftIcon,
  rightIcon,
  iconSize = 16,
  onLeftIconClick,
  onRightIconClick,
  leftIconClickable = false,
  rightIconClickable = false,
  isPasswordVisible,
  children,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {label && (
        <label className="font-light leading-6 text-base text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <button
            type="button"
            onClick={onLeftIconClick}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-opacity",
              leftIconClickable && "cursor-pointer hover:opacity-70 focus:outline-none",
              !leftIconClickable && "pointer-events-none"
            )}
            aria-label={leftIcon}
            tabIndex={leftIconClickable ? 0 : -1}
          >
            <Icon name={leftIcon} size={iconSize} />
          </button>
        )}
        <div
          className={cn(
            "flex items-center bg-white border mt-2 border-gray-20 text-gray-40 font-light text-base rounded-2xl h-10 px-4 py-2 transition-all",
            "hover:border-gray-30",
            "focus-within:border-primary-50 focus-within:text-gray-90",
            leftIcon && "pl-12",
            rightIcon && "pr-12"
          )}
        >
          {children}
        </div>
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 transition-all",
              rightIconClickable && "cursor-pointer hover:opacity-70 focus:outline-none",
              !rightIconClickable && "pointer-events-none"
            )}
            aria-label={rightIcon}
            tabIndex={rightIconClickable ? 0 : -1}
          >
            <Icon
              name={rightIcon}
              size={iconSize}
              color={rightIcon === "Eye" && isPasswordVisible ? "text-gray-90" : undefined}
            />
          </button>
        )}
      </div>
    </div>
  )
})
Input.displayName = "Input"

const InputField = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "leftIcon" | "rightIcon" | "iconSize"> & {
    label?: string
    leftIcon?: IconProps["name"]
    rightIcon?: IconProps["name"]
    iconSize?: number
    onLeftIconClick?: () => void
    onRightIconClick?: () => void
    leftIconClickable?: boolean
    rightIconClickable?: boolean
  }
>(({
  className,
  label,
  leftIcon,
  rightIcon,
  iconSize = 16,
  type = "text",
  value,
  onLeftIconClick,
  onRightIconClick,
  leftIconClickable = false,
  rightIconClickable = false,
  ...props
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [internalType, setInternalType] = React.useState(type);

  const hasValue = value && value.toString().length > 0;

  // Auto-detect password toggle
  const isPasswordToggle = rightIcon === "Eye" && type === "password";
  const isRightIconClickable = isPasswordToggle ? true : rightIconClickable;

  React.useEffect(() => {
    setInternalType(isPasswordToggle && !isPasswordVisible ? "password" : "text");
  }, [isPasswordToggle, isPasswordVisible]);

  const handleRightIconClick = () => {
    if (isPasswordToggle) {
      setIsPasswordVisible(!isPasswordVisible);
    }
    onRightIconClick?.();
  };

  return (
    <Input
      label={label}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      iconSize={iconSize}
      onLeftIconClick={onLeftIconClick}
      onRightIconClick={handleRightIconClick}
      leftIconClickable={leftIconClickable}
      rightIconClickable={isRightIconClickable}
      isPasswordVisible={isPasswordToggle ? isPasswordVisible : undefined}
    >
      <input
        type={internalType}
        ref={ref}
        value={value}
        className={cn(
          "flex-1 bg-transparent outline-none placeholder:text-gray-40 font-light leading-6 text-base",
          hasValue && "text-gray-90 font-medium",
          className
        )}
        {...props}
      />
    </Input>
  )
})
InputField.displayName = "InputField"

export { Input, InputField }
